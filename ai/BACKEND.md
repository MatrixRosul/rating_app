# Backend Implementation

## Stack

- **Framework**: FastAPI 0.104+
- **Language**: Python 3.12
- **ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Auth**: python-jose (JWT), passlib (bcrypt)
- **Database**: psycopg2 (PostgreSQL driver)
- **Testing**: pytest, pytest-asyncio

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app initialization
│   ├── database.py             # SQLAlchemy engine, session
│   ├── auth.py                 # JWT and password helpers
│   ├── dependencies.py         # Reusable dependencies
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── player.py
│   │   ├── match.py
│   │   ├── user.py
│   │   ├── tournament.py
│   │   └── tournament_registration.py
│   │
│   ├── routers/                # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py             # /api/auth/*
│   │   ├── players.py          # /api/players/*
│   │   ├── matches.py          # /api/matches/*
│   │   ├── tournaments.py      # /api/tournaments/*
│   │   └── participants.py     # /api/tournaments/{id}/participants/*
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   └── rating.py           # Rating calculation engine
│   │
│   ├── schemas/                # Pydantic schemas (future)
│   │   └── __init__.py
│   │
│   └── utils/
│       └── discipline_names.py # Display names for disciplines
│
├── scripts/                    # Utility scripts
│   ├── create_admin.py
│   ├── create_test_player_user.py
│   ├── migrate_tournaments.py
│   └── test_api.sh
│
├── tests/                      # Pytest tests
│   ├── conftest.py
│   ├── test_tournaments.py
│   └── test_participants.py
│
├── venv/                       # Python virtual environment
├── requirements.txt
└── pytest.ini
```

---

## Key Files

### main.py

**Purpose**: Application entry point

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, players, matches, tournaments, participants

app = FastAPI(title="Billiard Rating System API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", ...],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router)
app.include_router(players.router, prefix="/api/players")
app.include_router(matches.router, prefix="/api/matches")
app.include_router(tournaments.router)
app.include_router(participants.router)
```

**Key Points**:
- CORS configured for localhost:3000 (dev) and Vercel (prod)
- Auto-creates DB tables if they don't exist
- Includes all routers

---

### database.py

**Purpose**: Database connection and session management

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://maxrosul:password@localhost:5432/billiard_rating"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for getting DB session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Key Points**:
- Uses environment variable for connection string
- `get_db()` is a FastAPI dependency
- Auto-closes session after request

---

### auth.py

**Purpose**: JWT and password utilities

```python
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

---

### dependencies.py

**Purpose**: Reusable dependency injection

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.auth import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    payload = decode_token(token)
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_user(current_user: User = Depends(get_current_user)) -> User:
    """Require authenticated user (admin or user)"""
    if current_user.role == UserRole.GUEST:
        raise HTTPException(status_code=403, detail="User access required")
    return current_user
```

---

## API Routers

### auth.py (Router)

**Endpoints**:
- `POST /api/auth/login/` - Login and get JWT
- `GET /api/auth/me/` - Get current user info

**Example**:
```python
@router.post("/login/", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect credentials")
    
    token = create_access_token({"sub": user.username, "role": user.role.value})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "role": user.role.value,
        "player_id": user.player_id
    }
```

---

### players.py (Router)

**Endpoints**:
- `GET /api/players/` - List all players
- `POST /api/players/` - Create player (admin only)
- `GET /api/players/{id}` - Get player details

**Key Logic**:
```python
@router.post("/", response_model=PlayerResponse, status_code=201)
async def create_player(
    player_data: PlayerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Check duplicate name
    existing = db.query(Player).filter(Player.name == player_data.name).first()
    if existing:
        raise HTTPException(400, detail="Player already exists")
    
    # Validate rating
    if not 0 <= player_data.rating <= 3000:
        raise HTTPException(400, detail="Invalid rating")
    
    # Create player
    new_player = Player(
        name=player_data.name,
        rating=player_data.rating,
        initial_rating=player_data.rating,
        peak_rating=player_data.rating,
        ...
    )
    db.add(new_player)
    db.commit()
    db.refresh(new_player)
    
    return new_player
```

---

### tournaments.py (Router)

**Endpoints**:
- `GET /api/tournaments/` - List tournaments
- `POST /api/tournaments/` - Create tournament (admin)
- `GET /api/tournaments/{id}` - Get tournament details
- `PATCH /api/tournaments/{id}` - Update tournament (admin)
- `DELETE /api/tournaments/{id}` - Delete tournament (admin)

**Business Rules**:
- Only admin can create/edit/delete
- Validates registration_end is required
- Checks discipline enum values
- Returns registered_count (participant count)
- Returns is_registered (if current user is registered)

---

### participants.py (Router)

**Endpoints**:
1. `GET /api/tournaments/{id}/participants` - List participants
   - Query: `?status_filter=all|confirmed|pending`
   - Returns sorted by rating (desc)

2. `POST /api/tournaments/{id}/participants/register` - User self-registration
   - Requires authenticated user with player_id
   - Sets status = 'pending'
   - Requires tournament status = 'registration'

3. `POST /api/tournaments/{id}/participants/add` - Admin adds player
   - Body: `{ "player_id": 123 }`
   - Sets status = 'confirmed'
   - Requires admin role

4. `PATCH /api/tournaments/{id}/participants/{pid}/confirm` - Confirm pending
   - Changes status: pending → confirmed
   - Requires admin role

5. `PATCH /api/tournaments/{id}/participants/{pid}/reject` - Reject pending
   - Changes status: pending → rejected
   - Requires admin role

6. `DELETE /api/tournaments/{id}/participants/{pid}` - Remove participant
   - Admin can remove anyone during registration
   - Requires admin role

**Example**:
```python
@router.post("/register", status_code=201)
def register_for_tournament(
    tournament_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_user)
):
    # Check user has player profile
    if not current_user.player_id:
        raise HTTPException(400, detail="No player profile")
    
    # Check tournament exists and is open
    tournament = db.query(Tournament).get(tournament_id)
    if not tournament:
        raise HTTPException(404, detail="Tournament not found")
    
    if tournament.status != TournamentStatus.REGISTRATION:
        raise HTTPException(400, detail="Registration closed")
    
    # Check not already registered
    existing = db.query(TournamentRegistration).filter_by(
        tournament_id=tournament_id,
        player_id=current_user.player_id
    ).first()
    
    if existing:
        raise HTTPException(409, detail="Already registered")
    
    # Create registration
    registration = TournamentRegistration(
        tournament_id=tournament_id,
        player_id=current_user.player_id,
        status=ParticipantStatus.PENDING,
        registered_at=datetime.utcnow(),
        registered_by_user_id=None  # Self-registration
    )
    db.add(registration)
    db.commit()
    
    return {"message": "Registration successful, awaiting confirmation"}
```

---

## Services

### rating.py

**Purpose**: Rating calculation engine (v3.1.1)

**Main Function**:
```python
def calculate_rating_change(
    player1_rating: int,
    player2_rating: int,
    player1_score: int,
    player2_score: int,
    max_score: int,
    player1_games: int = 30,
    player2_games: int = 30,
    stage: str = None
) -> dict:
    """
    Calculate rating changes for both players
    
    Returns:
        {
            "player1_change": float,
            "player2_change": float
        }
    """
```

**Algorithm** (see BUSINESS_LOGIC.md for details):
1. Calculate expected score (ELO)
2. Calculate actual score (with elite logic)
3. Determine K-factor (based on games played)
4. Apply margin multiplier (score difference)
5. Apply stage weights (final > semifinal > group)
6. Apply underdog bonus (if upset)
7. Apply loss protection (for beginners)
8. Cap maximum change (zone-dependent)

---

## Testing

### Structure
```
tests/
├── conftest.py              # Fixtures
├── test_tournaments.py      # 15 tests
└── test_participants.py     # 17 tests
```

### Fixtures (conftest.py)
```python
@pytest.fixture
def db():
    """Test database session"""
    ...

@pytest.fixture
def client(db):
    """FastAPI test client"""
    return TestClient(app)

@pytest.fixture
def test_admin(db):
    """Create test admin user"""
    ...

@pytest.fixture
def test_player(db):
    """Create test player"""
    ...

@pytest.fixture
def admin_token(test_admin):
    """Get admin JWT token"""
    ...
```

### Running Tests
```bash
cd backend
pytest -v
pytest tests/test_tournaments.py -v
pytest tests/test_participants.py::TestParticipantRegistration -v
```

---

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-secret-key-here

# Optional
FRONTEND_URL=https://your-frontend.vercel.app
PORT=8000
```

---

## Running Locally

```bash
# Install dependencies
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment
export DATABASE_URL=postgresql://maxrosul:password@localhost:5432/billiard_rating
export SECRET_KEY=dev-secret-key

# Run server
uvicorn app.main:app --reload --port 8000
```

---

## Common Commands

```bash
# Create admin user
python scripts/create_admin.py

# Create test player user
python scripts/create_test_player_user.py

# Run tests
pytest -v

# Check test coverage
pytest --cov=app tests/
```

---

## Error Handling

All endpoints use FastAPI's HTTPException:

```python
# 400 Bad Request
raise HTTPException(status_code=400, detail="Invalid data")

# 401 Unauthorized
raise HTTPException(status_code=401, detail="Not authenticated")

# 403 Forbidden
raise HTTPException(status_code=403, detail="Admin access required")

# 404 Not Found
raise HTTPException(status_code=404, detail="Resource not found")

# 409 Conflict
raise HTTPException(status_code=409, detail="Already exists")
```

Frontend receives:
```json
{
  "detail": "Error message here"
}
```

---

## Performance Notes

- Database queries use eager loading where needed
- No N+1 query problems (joins used properly)
- Pagination supported: `?skip=0&limit=100`
- Indexes on foreign keys
- Connection pooling via SQLAlchemy

---

## Security Checklist

✅ Password hashing (bcrypt, 12 rounds)
✅ JWT tokens (30 day expiry)
✅ CORS whitelist
✅ SQL injection prevention (ORM)
✅ Input validation (Pydantic)
✅ Role-based access control
❌ Rate limiting (TODO)
❌ HTTPS enforcement (handled by Heroku)
