# Authentication & Roles

## Overview

The system uses **JWT (JSON Web Tokens)** for authentication and **role-based access control** (RBAC) for authorization.

---

## User Roles

### 1. GUEST
- **Access**: Read-only, public data
- **No login required**
- Can view:
  - Public leaderboard
  - Tournament list (public info)
  - Player profiles (basic stats)

### 2. USER
- **Access**: Basic authenticated user
- **Requires**: Login + player profile
- Can do:
  - Everything GUEST can do
  - Self-register for tournaments
  - View own match history
  - Edit own profile (future)

### 3. ADMIN
- **Access**: Full system control
- **Requires**: Login with admin role
- Can do:
  - Everything USER can do
  - Create/edit/delete tournaments
  - Manage participants (confirm/reject/remove)
  - Create new players
  - Edit match results
  - Recalculate ratings
  - Access admin panel

---

## Authentication Flow

### 1. User Registration (Manual)

Currently, users are created manually by admin:

```bash
# Backend script
python backend/scripts/create_test_player_user.py
```

Creates:
```python
User(
    username="maksim",
    password_hash=bcrypt_hash("maksim123"),
    role=UserRole.USER,
    player_id=782  # Link to existing player
)
```

**Future**: Self-registration with email verification

---

### 2. Login Process

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Enter username + password
       │    in LoginModal
       ▼
┌──────────────────────┐
│  POST /api/auth/login│
│  Body: {             │
│    username,         │
│    password          │
│  }                   │
└──────┬───────────────┘
       │ 2. Backend verifies password
       │    (bcrypt.verify)
       ▼
┌──────────────────────┐
│  Create JWT token    │
│  Payload: {          │
│    sub: username,    │
│    role: "admin",    │
│    exp: timestamp    │
│  }                   │
│  Sign with SECRET_KEY│
└──────┬───────────────┘
       │ 3. Return token
       ▼
┌──────────────────────┐
│  Browser stores:     │
│  localStorage.       │
│    setItem(          │
│      'auth_token',   │
│      token           │
│    )                 │
└──────┬───────────────┘
       │ 4. Update AuthContext
       ▼
    [Logged In]
```

**Response**:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "username": "admin",
  "role": "admin",
  "player_id": null
}
```

---

### 3. Making Authenticated Requests

Every API call includes the token:

```typescript
const token = localStorage.getItem('auth_token');

fetch('/api/tournaments/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

Backend extracts token:
```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login/")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    payload = jwt.decode(token, SECRET_KEY)
    username = payload["sub"]
    user = db.query(User).filter(User.username == username).first()
    return user
```

---

### 4. Logout Process

```
1. User clicks "Logout"
   ↓
2. Frontend removes token from localStorage
   localStorage.removeItem('auth_token')
   ↓
3. Update AuthContext (user = null)
   ↓
4. Redirect to home page
```

**Note**: No server-side logout needed (JWT is stateless)

---

## Authorization (Role Checks)

### Backend Enforcement

#### Require Admin
```python
from app.dependencies import require_admin

@router.post("/api/tournaments/")
def create_tournament(
    data: TournamentCreate,
    current_user: User = Depends(require_admin)
):
    # Only admins reach here
    ...
```

#### Require Authenticated User
```python
from app.dependencies import require_user

@router.post("/api/tournaments/{id}/participants/register")
def register(
    tournament_id: int,
    current_user: User = Depends(require_user)
):
    # Users and admins reach here
    ...
```

#### Optional Auth
```python
from app.dependencies import get_current_user_optional

@router.get("/api/tournaments/")
def get_tournaments(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Anyone can access
    # If logged in, current_user is set
    # If not, current_user is None
    ...
```

### Frontend Conditional Rendering

```tsx
const { user, isAdmin } = useAuth();

{isAdmin && (
  <button onClick={handleCreate}>
    Create Tournament
  </button>
)}

{user && tournament.status === 'registration' && (
  <button onClick={handleRegister}>
    Register
  </button>
)}
```

---

## JWT Token Structure

### Payload
```json
{
  "sub": "admin",           // Username (subject)
  "role": "admin",          // User role
  "exp": 1704556800         // Expiration timestamp
}
```

### Token Lifecycle
- **Generated**: On login
- **Stored**: localStorage (frontend)
- **Expires**: 30 days
- **Validated**: On every request (backend)

---

## Security Measures

### Password Handling

1. **Never store plain passwords**
   - Only password_hash in database

2. **Hashing**: bcrypt with 12 rounds
   ```python
   from passlib.context import CryptContext
   
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   password_hash = pwd_context.hash("plain_password")
   ```

3. **Verification**:
   ```python
   is_valid = pwd_context.verify("plain_password", password_hash)
   ```

### Token Security

1. **Secret Key**:
   - Stored in environment variable
   - Never committed to git
   - Different for dev/prod

2. **Algorithm**: HS256 (HMAC SHA-256)

3. **Expiration**: 30 days
   - Prevents indefinite access with stolen token

4. **No Refresh Tokens** (yet)
   - User must re-login after 30 days

### HTTPS

- Production: Enforced by Vercel/Heroku
- Development: Not required (localhost)

---

## Permission Matrix

| Action | GUEST | USER | ADMIN |
|--------|-------|------|-------|
| View tournaments | ✅ | ✅ | ✅ |
| View leaderboard | ✅ | ✅ | ✅ |
| View player profiles | ✅ | ✅ | ✅ |
| Register for tournament | ❌ | ✅* | ✅* |
| Create tournament | ❌ | ❌ | ✅ |
| Edit tournament | ❌ | ❌ | ✅ |
| Delete tournament | ❌ | ❌ | ✅ |
| Confirm participants | ❌ | ❌ | ✅ |
| Reject participants | ❌ | ❌ | ✅ |
| Remove participants | ❌ | ❌ | ✅ |
| Add participant manually | ❌ | ❌ | ✅ |
| Create new player | ❌ | ❌ | ✅ |
| Edit match results | ❌ | ❌ | ✅ |

*Requires player_id (linked to player profile)

---

## Special Cases

### User Without Player Profile

A user can exist without a player profile:
```python
User(
    username="admin",
    role=UserRole.ADMIN,
    player_id=None  # No player profile
)
```

**Limitations**:
- Cannot self-register for tournaments
- Can still use all admin functions

**Use Case**: Admin accounts that don't play

---

### Player Without User Account

A player can exist without a user account:
```python
Player(
    id=123,
    name="John Doe",
    rating=1500
)
# No corresponding User record
```

**Limitations**:
- Cannot login
- Cannot self-register
- Admin must add them manually

**Use Case**: Most players (not all have accounts)

---

### Multiple Users, One Player?

**No.** One player can have 0 or 1 user account.

Database constraint:
```python
player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
```

If multiple users need same player:
- Only one should have player_id set
- Others are separate accounts

---

## Creating Admin User

### Manual Creation (Script)
```bash
cd backend
python scripts/create_admin.py
```

```python
# create_admin.py
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.auth import get_password_hash

db = SessionLocal()

admin = User(
    username="admin",
    password_hash=get_password_hash("admin123"),
    role=UserRole.ADMIN,
    player_id=None
)

db.add(admin)
db.commit()
```

### Direct SQL (Emergency)
```sql
INSERT INTO users (username, password_hash, role, player_id)
VALUES (
    'admin',
    '$2b$12$...', -- bcrypt hash of "admin123"
    'admin',
    NULL
);
```

---

## Testing Authentication

### Get Token
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "username": "admin",
  "role": "admin",
  "player_id": null
}
```

### Use Token
```bash
TOKEN="eyJhbGc..."

curl http://localhost:8000/api/tournaments/ \
  -H "Authorization: Bearer $TOKEN"
```

### Test Admin Endpoint
```bash
# Should succeed with admin token
curl -X POST http://localhost:8000/api/tournaments/ \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","city":"Kyiv",...}'

# Should fail (403) with user token
curl -X POST http://localhost:8000/api/tournaments/ \
  -H "Authorization: Bearer $USER_TOKEN" \
  ...
```

---

## Future Enhancements

### Planned
- ✅ Basic JWT auth
- ✅ Role-based access
- ⬜ Email verification
- ⬜ Password reset
- ⬜ Refresh tokens
- ⬜ 2FA (Two-Factor Authentication)
- ⬜ OAuth (Google, Facebook login)
- ⬜ Session management dashboard
- ⬜ Audit log (who did what, when)

### Security Improvements
- ⬜ Rate limiting (prevent brute force)
- ⬜ Account lockout (after X failed attempts)
- ⬜ HTTPS-only cookies (instead of localStorage)
- ⬜ CSRF protection (if using cookies)
- ⬜ Content Security Policy headers

---

## Common Issues

### "401 Unauthorized" Error
**Cause**: Token invalid or expired
**Solution**: Login again

### "403 Forbidden" Error
**Cause**: Wrong role (e.g., user trying admin action)
**Solution**: Check user role

### Token Expired
**Cause**: 30 days passed
**Solution**: Login again (no refresh token yet)

### Lost Admin Password
**Solution**: 
1. Reset via database:
   ```python
   from app.auth import get_password_hash
   new_hash = get_password_hash("new_password")
   # Update database manually
   ```
2. Or create new admin user

---

## AuthContext API (Frontend)

```typescript
interface AuthContextType {
  user: {
    username: string;
    role: 'admin' | 'user' | 'guest';
    playerId?: number;
  } | null;
  
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  
  isAdmin: boolean;
  loading: boolean;
}

// Usage
const { user, isAdmin, login, logout } = useAuth();
```

### Example: Protected Component
```tsx
function AdminPanel() {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!isAdmin) {
    return <div>Access denied</div>;
  }
  
  return <div>Admin controls...</div>;
}
```

---

## Summary

- **Authentication**: JWT tokens (30 day expiry)
- **Authorization**: Role-based (GUEST, USER, ADMIN)
- **Password Security**: bcrypt (12 rounds)
- **Token Storage**: localStorage (frontend)
- **Token Validation**: Every request (backend)
- **No Session State**: Stateless architecture
- **Admin Creation**: Manual (script or SQL)
- **User-Player Link**: Optional, one-to-one
