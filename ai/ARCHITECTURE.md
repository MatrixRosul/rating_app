# Architecture

## System Design

```
┌─────────────────┐
│   Browser       │
│   (Next.js)     │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend API   │
│   (FastAPI)     │
└────────┬────────┘
         │ SQL
         │
┌────────▼────────┐
│   PostgreSQL    │
└─────────────────┘
```

## Data Flow

### Example: User Registers for Tournament

```
1. User clicks "Зареєструватись" button
   └─> Frontend: ParticipantsPage.tsx

2. Frontend sends POST request
   POST /api/tournaments/{id}/participants/register
   Headers: { Authorization: Bearer <token> }
   
3. Backend receives request
   └─> routers/participants.py: register_for_tournament()
   
4. Backend validates:
   - User is authenticated (JWT)
   - User has player_id
   - Tournament exists
   - Tournament status = 'registration'
   - Player not already registered
   
5. Backend creates TournamentRegistration
   - player_id from current_user
   - status = 'pending'
   - registered_by_admin = False
   
6. Backend commits to DB
   
7. Backend returns 201 Created
   
8. Frontend receives response
   └─> Updates UI, shows success message
```

## Frontend Architecture

### Layers

1. **Pages** (`/app`)
   - App Router structure
   - Server Components by default
   - Client Components marked with 'use client'
   - Handle routing and layout

2. **Components** (`/components`)
   - Reusable UI pieces
   - NO business logic
   - Receive data via props
   - Call API via fetch

3. **Context** (`/context`)
   - AuthContext: user session, login/logout
   - AppContext: global state (future)

4. **Utils** (`/utils`)
   - getRatingBand(): returns color for rating
   - getRatingColor(): returns Tailwind class
   - getDisciplineLabel(): formats discipline names

5. **Types** (`/types`)
   - TypeScript interfaces
   - MUST match backend schemas (camelCase)

### Key Principle

**Frontend does NOT:**
- Calculate ratings
- Validate tournament rules
- Filter participants by status (backend does it)
- Check permissions deeply (backend enforces)

**Frontend DOES:**
- Display data
- Collect user input
- Send to backend
- Show errors from backend

## Backend Architecture

### Layers

1. **Routers** (`/routers`)
   - Define API endpoints
   - Request/response validation (Pydantic)
   - Call services
   - Return JSON

2. **Models** (`/models`)
   - SQLAlchemy ORM models
   - Database table definitions
   - Relationships

3. **Services** (`/services`)
   - Business logic
   - Rating calculations
   - Complex operations

4. **Dependencies** (`/dependencies`)
   - Reusable dependency injection
   - get_current_user()
   - require_admin()
   - require_user()

5. **Schemas** (`/schemas`)
   - Pydantic models for validation
   - Request/Response types

### Key Principle

**Backend MUST:**
- Validate everything
- Enforce permissions
- Calculate ratings
- Apply business rules
- Return consistent errors

## API Design

### URL Structure

```
/api/auth/
  POST /login/        - Get JWT token
  GET  /me/           - Current user info

/api/players/
  GET  /              - List all players
  POST /              - Create player (admin)
  GET  /{id}          - Get player details

/api/matches/
  GET  /              - List matches
  POST /              - Create match (admin)

/api/tournaments/
  GET  /              - List tournaments
  POST /              - Create tournament (admin)
  GET  /{id}          - Get tournament details
  PATCH /{id}         - Update tournament (admin)
  DELETE /{id}        - Delete tournament (admin)

/api/tournaments/{id}/participants/
  GET  /                      - List participants
  POST /register              - Self-register (user)
  POST /add                   - Add player (admin)
  PATCH /{pid}/confirm        - Confirm (admin)
  PATCH /{pid}/reject         - Reject (admin)
  DELETE /{pid}               - Remove (admin)
```

### Request/Response Format

**Backend sends snake_case:**
```json
{
  "player_id": 123,
  "player_name": "John Doe",
  "registered_at": "2026-01-06T12:00:00"
}
```

**Frontend converts to camelCase:**
```typescript
{
  playerId: 123,
  playerName: "John Doe",
  registeredAt: "2026-01-06T12:00:00"
}
```

### Error Responses

```json
{
  "detail": "Human-readable error message"
}
```

Status codes:
- 400: Bad Request (validation error)
- 401: Unauthorized (no token)
- 403: Forbidden (wrong role)
- 404: Not Found
- 409: Conflict (duplicate)
- 500: Server Error

## Database Architecture

### Relationships

```
users (1) ──────── (0..1) players
  │
  └─> created_tournaments (many)

players (1) ────── (many) tournament_registrations
  │
  └─> matches (many, as player1 or player2)

tournaments (1) ── (many) tournament_registrations
  │
  └─> created_by_admin (1) user

tournament_registrations
  ├─> tournament (1)
  ├─> player (1)
  └─> registered_by_user (0..1)
```

### Constraints

- User can have 0 or 1 player profile
- Player can be in many tournaments
- Tournament has many participants via registrations
- Match belongs to 0 or 1 tournament
- All ratings stored as FLOAT (never NULL)
- Enum values stored as lowercase in PostgreSQL

### Critical Database Notes

**PostgreSQL Enums**:
- All enum types use **lowercase values**
- TournamentStatus: 'registration', 'in_progress', 'finished'
- TournamentDiscipline: 'free_pyramid', 'dynamic_pyramid', etc.
- Never use uppercase values - causes `invalid input value` errors

**Alembic Migrations**:
- Located in `backend/alembic/versions/`
- Run with: `alembic upgrade head`
- Critical migration: `20260107094620_fix_enum_values.py` (lowercase conversion)

## Authentication Flow

```
1. User submits username + password
   └─> POST /api/auth/login/

2. Backend verifies password (bcrypt)
   └─> If valid, creates JWT token

3. Token contains:
   {
     "sub": "username",
     "role": "admin",
     "exp": 1234567890
   }

4. Frontend stores token in localStorage

5. Every API request includes:
   Headers: { Authorization: "Bearer <token>" }

6. Backend validates token:
   - Signature valid?
   - Not expired?
   - User exists?

7. If valid, backend attaches user to request
   └─> current_user available in route handlers
```

## State Management

### Frontend

- **AuthContext**: user, login, logout, isAdmin
- **Local State**: useState for component data
- **URL State**: useParams, useSearchParams

### Backend

- **Session**: SQLAlchemy session per request
- **Stateless**: no server-side session storage
- **JWT**: all user info in token

## File Structure Deep Dive

### Frontend

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── tournaments/
│   │   ├── page.tsx            # Tournament list
│   │   └── [id]/
│   │       ├── layout.tsx      # Tournament header + tabs
│   │       ├── regulations/
│   │       │   └── page.tsx    # Info about tournament
│   │       └── participants/
│   │           └── page.tsx    # Registration + list
│   ├── player/
│   │   └── [id]/
│   │       └── page.tsx        # Player profile
│   └── rating/
│       └── page.tsx            # Leaderboard
│
├── components/
│   ├── Header.tsx              # Nav bar
│   ├── LoginModal.tsx          # Auth popup
│   ├── TournamentList.tsx      # List with filters
│   ├── CreateTournamentModal.tsx
│   ├── AddParticipantModal.tsx # Search or create player
│   ├── CountdownTimer.tsx      # Real-time countdown
│   ├── RatingChart.tsx         # Player rating graph
│   └── ...
│
├── context/
│   └── AuthContext.tsx         # User session
│
├── types/
│   └── index.ts                # All TS interfaces
│
└── utils/
    ├── rating.ts               # getRatingBand, getRatingColor
    └── discipline.ts           # getDisciplineLabel
```

### Backend

```
app/
├── main.py                 # FastAPI app, CORS, routers
├── database.py             # SQLAlchemy engine, session
├── auth.py                 # JWT, bcrypt helpers
├── dependencies.py         # Dependency injection
│
├── models/
│   ├── player.py           # Player table
│   ├── match.py            # Match table
│   ├── user.py             # User, UserRole enum
│   ├── tournament.py       # Tournament, TournamentStatus, TournamentDiscipline
│   ├── tournament_registration.py  # Many-to-many with ParticipantStatus
│   └── tournament_rule.py  # Bracket configuration
│
├── routers/
│   ├── auth.py             # /api/auth/login, /me
│   ├── players.py          # /api/players/*
│   ├── matches.py          # /api/matches/*
│   ├── tournaments.py      # /api/tournaments/*
│   └── participants.py     # /api/tournaments/{id}/participants/*
│
├── services/
│   ├── rating.py           # Rating calculation engine (v3.1.1)
│   ├── seeding_service.py  # Generate bracket seeds
│   ├── bracket_generator.py # Generate tournament brackets
│   └── tournament_start_service.py  # Start tournament logic
│
├── scripts/
│   ├── create_admin.py     # Create admin user
│   ├── create_users_for_players.py  # Generate 151 user accounts
│   └── import_csv.py       # Import players/matches from CSV
│
├── alembic/                # Database migrations
│   └── versions/
│       └── 20260107094620_fix_enum_values.py  # Critical enum fix
│
└── tests/
    ├── conftest.py         # Pytest fixtures
    ├── test_tournaments.py
    └── test_participants.py
```

## Design Patterns Used

1. **Repository Pattern** (implicit)
   - SQLAlchemy ORM acts as repository
   - db.query(Player).filter(...).first()

2. **Dependency Injection**
   - FastAPI Depends()
   - db: Session = Depends(get_db)
   - current_user: User = Depends(require_admin)

3. **DTO (Data Transfer Object)**
   - Pydantic models for API
   - PlayerCreate, TournamentResponse, etc.

4. **Context API** (frontend)
   - AuthContext for global user state

5. **Composition** (frontend)
   - Small reusable components
   - TournamentList uses PlayerCard

## Performance Considerations

- **Pagination**: GET /api/players?skip=0&limit=100
- **Lazy loading**: SQLAlchemy relationships
- **Indexing**: Primary keys, username, player names
- **Caching**: None yet (future: Redis for leaderboard)

## Security

- **Password hashing**: bcrypt (12 rounds)
- **JWT**: HS256 algorithm, 30 day expiry
- **CORS**: Whitelist specific origins
- **SQL Injection**: SQLAlchemy ORM prevents
- **XSS**: React escapes by default
- **CSRF**: Not needed (stateless JWT)

## Testing Strategy

- **Backend**: Pytest with fixtures
  - Integration tests (full request/response)
  - Test database (separate from dev)
  - 32 tests currently (15 tournaments, 17 participants)

- **Frontend**: Not yet implemented
  - Plan: Jest + React Testing Library

## Deployment Architecture

```
GitHub Repo
    ├─> Vercel (frontend)
    │   └─> Auto-deploy on push
    │
    └─> Heroku (backend)
        └─> Manual deploy
        └─> PostgreSQL add-on
```

See `DEPLOYMENT.md` for details.
