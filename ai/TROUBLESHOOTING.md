# Troubleshooting Guide

This document contains solutions to critical issues encountered during development and deployment.

---

## PostgreSQL Enum Type Issues

### Problem: "invalid input value for enum tournamentstatus: 'REGISTRATION'"

**Symptom**: Tournament creation returns 500 error with enum validation failure.

**Root Cause**: PostgreSQL enum types are case-sensitive. Database expects lowercase "registration" but receives uppercase "REGISTRATION".

**Multiple Causes Discovered**:

1. **Python enum values defined as uppercase**
   ```python
   # ❌ WRONG
   class TournamentDiscipline(str, enum.Enum):
       FREE_PYRAMID = "FREE_PYRAMID"
   ```

2. **SQLAlchemy Enum default using enum object**
   ```python
   # ❌ WRONG - Uses .name ("REGISTRATION")
   status = Column(Enum(TournamentStatus), default=TournamentStatus.REGISTRATION)
   ```

3. **Frontend sends uppercase, backend doesn't convert**
   ```typescript
   // Frontend sends
   discipline: "DYNAMIC_PYRAMID"
   // Database expects
   discipline: "dynamic_pyramid"
   ```

### Solution (Multi-Step Fix)

**Step 1: Define enums with lowercase values**
```python
# backend/app/models/tournament.py
class TournamentDiscipline(str, enum.Enum):
    FREE_PYRAMID = "free_pyramid"  # lowercase value
    DYNAMIC_PYRAMID = "dynamic_pyramid"
    # etc.

class TournamentStatus(str, enum.Enum):
    REGISTRATION = "registration"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
```

**Step 2: Create Alembic migration to update database**
```bash
alembic revision -m "fix_enum_lowercase"
```

Migration converts existing data:
```python
# Rename old enum types
op.execute("ALTER TYPE tournamentstatus RENAME TO tournamentstatus_old")
op.execute("ALTER TYPE tournamentdiscipline RENAME TO tournamentdiscipline_old")

# Create new lowercase enum types
op.execute("""
    CREATE TYPE tournamentstatus AS ENUM (
        'registration', 'in_progress', 'finished'
    )
""")

# Convert column data
op.execute("""
    ALTER TABLE tournaments 
    ALTER COLUMN status TYPE tournamentstatus 
    USING LOWER(status::text)::tournamentstatus
""")

# Drop old types
op.execute("DROP TYPE tournamentstatus_old")
```

**Step 3: Add field validator in router**
```python
# backend/app/routers/tournaments.py
from pydantic import BaseModel, field_validator

class CreateTournamentRequest(BaseModel):
    discipline: str
    
    @field_validator('discipline', mode='before')
    @classmethod
    def validate_discipline(cls, v):
        if isinstance(v, str):
            return v.lower()  # Convert uppercase to lowercase
        return v
```

**Step 4: Use string for Column defaults, not enum objects**
```python
# backend/app/models/tournament.py
class Tournament(Base):
    status = Column(
        Enum(TournamentStatus), 
        nullable=False, 
        default="registration"  # ✅ String, not enum
    )
```

**Step 5: Use .value when assigning enums**
```python
# In router
new_tournament = Tournament(
    discipline=tournament_data.discipline.value,  # Use .value
    status="registration"  # Direct string
)
```

### Deployment Process

```bash
# 1. Update code locally
git add -A
git commit -m "Fix enum values to lowercase"

# 2. Deploy to Heroku
git push heroku main

# 3. Run migration on Heroku
heroku run "cd backend && alembic upgrade head"

# 4. Restart dyno to clear Python module cache
heroku restart --app rating-app

# 5. Wait 10-15 seconds, then test
```

### Verification

```bash
# Check deployed code
heroku run "cat backend/app/models/tournament.py | grep -A 2 'status = Column'"

# Check database enum values
heroku pg:psql
\dT+ tournamentstatus

# Should show:
# 'registration' | 'in_progress' | 'finished'
```

---

## Heroku Python Module Caching

### Problem: Code changes deployed but not reflected

**Symptom**: After deployment, code changes visible in files but runtime still uses old behavior.

**Root Cause**: Python imports and caches modules on startup. Heroku deployments don't automatically restart processes.

**Example**:
```bash
# Verify code is correct
heroku run "grep 'default=' backend/app/models/tournament.py"
# Output: default="registration" ✅

# But logs still show old behavior
heroku logs --tail
# Output: 'status': 'REGISTRATION' ❌
```

### Solution

**Always restart dyno after code deployment**:
```bash
heroku restart --app rating-app
```

**Wait for restart to complete**:
- Takes 10-15 seconds
- Watch logs: `heroku logs --tail`
- Look for "Starting process" messages

**Verify restart worked**:
```bash
# Check dyno status
heroku ps

# Test API endpoint
curl https://rating-app-000c25dfc4f1.herokuapp.com/api/players/ | head
```

### Prevention

Add restart to deployment workflow:
```bash
git push heroku main && heroku restart --app rating-app
```

---

## CORS Errors Masking 500 Errors

### Problem: Frontend shows CORS error, but real issue is 500

**Symptom**: 
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Root Cause**: When backend returns 500 error, CORS headers are not set, causing browser to show CORS error instead of actual error.

### Solution

**Check backend logs first**:
```bash
heroku logs --tail
```

**Look for actual error**:
```
ERROR: invalid input value for enum tournamentstatus: "REGISTRATION"
```

**Fix actual error** (see PostgreSQL Enum section above)

**Verify CORS is correctly configured**:
```python
# backend/app/main.py
allowed_origins = [
    "http://localhost:3000",
    "https://rating-app-mu-murex.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in allowed_origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Test CORS directly**:
```bash
curl -X OPTIONS "https://rating-app-000c25dfc4f1.herokuapp.com/api/tournaments/" \
  -H "Origin: https://rating-app-mu-murex.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

---

## User Account Creation

### Problem: Generate 151 user accounts with Ukrainian names

**Requirements**:
- Username: Ukrainian name → Latin transliteration
- Password: Random 8-character alphanumeric
- Role: USER
- Link to existing player

### Solution: create_users_for_players.py

**Transliteration Map**:
```python
TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g',
    'д': 'd', 'е': 'e', 'є': 'ye', 'ж': 'zh', 'з': 'z',
    'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k',
    'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p',
    'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ь': '', 'ю': 'yu', 'я': 'ya',
    "'": '', ''': '', 'ʼ': ''
}
```

**Username Generation**:
```python
def generate_username(name: str) -> str:
    """Микола Шикітка → mykola_shykitka"""
    name_lower = name.lower()
    transliterated = ''.join(TRANSLIT_MAP.get(c, c) for c in name_lower)
    cleaned = ''.join(c if c.isalnum() else ' ' for c in transliterated)
    return '_'.join(cleaned.split())
```

**Password Generation**:
```python
import random
import string

def generate_password(length: int = 8) -> str:
    """Generate random alphanumeric password"""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))
```

**Local Execution**:
```bash
cd backend
python scripts/create_users_for_players.py
# Credentials saved to users_credentials.txt
```

**Heroku Execution**:
```bash
heroku run "cd backend && python scripts/create_users_for_players.py"
# Credentials only in terminal - SAVE IMMEDIATELY
```

**Heroku Gotcha**: Filesystem is ephemeral
- Files created during `heroku run` are NOT saved
- Copy credentials from terminal output before session ends
- No persistent file storage on Heroku dynos

---

## Database Migration Issues

### Problem: Multiple head revisions

**Symptom**:
```
alembic.util.exc.CommandError: Multiple head revisions are present
```

**Root Cause**: Two migrations have no parent-child relationship.

**Solution**:
```bash
# Check current heads
alembic heads

# Find revision IDs
alembic history

# Edit new migration file
# Set down_revision to the actual current head
down_revision = '06756e52db35'  # Not '6d3c2bd01fda'
```

### Problem: Migration fails on Heroku

**Symptom**: Migration works locally but fails on Heroku.

**Causes**:
1. Alembic not in requirements.txt
2. Wrong DATABASE_URL
3. Tables already exist

**Solution**:
```bash
# 1. Add alembic to requirements.txt
echo "alembic==1.13.1" >> backend/requirements.txt

# 2. Verify DATABASE_URL
heroku config:get DATABASE_URL

# 3. Check current migration version
heroku run "cd backend && alembic current"

# 4. Apply migrations
heroku run "cd backend && alembic upgrade head"

# 5. Check for errors
heroku logs --tail
```

---

## Debugging Tips

### Check actual deployed code
```bash
# View file contents on Heroku
heroku run "cat backend/app/models/tournament.py | grep -A 5 'class Tournament'"

# Search for specific pattern
heroku run "grep -r 'default=' backend/app/models/"

# Check Python environment
heroku run "python --version"
heroku run "pip list | grep alembic"
```

### Monitor logs in real-time
```bash
# All logs
heroku logs --tail

# Filter by pattern
heroku logs --tail | grep -E "ERROR|status|enum"

# Last 200 lines
heroku logs -n 200
```

### Test API endpoints directly
```bash
# Get request
curl https://rating-app-000c25dfc4f1.herokuapp.com/api/players/ | jq

# Post request
curl -X POST "https://rating-app-000c25dfc4f1.herokuapp.com/api/tournaments/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test", ...}'
```

### Check database directly
```bash
# Connect to Heroku PostgreSQL
heroku pg:psql

# View enum types
\dT+

# View enum values
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'tournamentstatus'::regtype;

# Check tournament data
SELECT id, name, status, discipline FROM tournaments LIMIT 5;
```

---

## Common Error Messages

### "invalid input value for enum"
→ See PostgreSQL Enum section above

### "column does not exist"
→ Run migrations: `alembic upgrade head`

### "relation does not exist"
→ Tables not created. Restart app or run migrations.

### "CORS policy: No 'Access-Control-Allow-Origin' header"
→ Check backend logs for 500 error (see CORS section)

### "Authentication required"
→ Include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGc...
```

### "Admin access required"
→ User role is USER, endpoint requires ADMIN

### "Player not found"
→ User account not linked to player profile (player_id is NULL)

---

## Best Practices

1. **Always check backend logs first** when frontend shows errors
2. **Restart Heroku dyno** after every code deployment
3. **Test migrations locally** before running on production
4. **Save Heroku credentials immediately** - filesystem is ephemeral
5. **Use lowercase for PostgreSQL enums** - case matters
6. **Never use enum objects as defaults** - use strings
7. **Add field validators** when frontend sends different format than database expects
8. **Verify deployed code** with `heroku run "cat file.py"`
9. **Monitor logs during testing** with `heroku logs --tail`
10. **Document all enum changes** in migration files
