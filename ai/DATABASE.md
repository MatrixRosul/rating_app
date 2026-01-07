# Database Schema

## Tables

### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL,  -- 'admin' | 'user' | 'guest'
    player_id INTEGER REFERENCES players(id)
);
```

**Purpose**: Authentication and authorization

**Key Fields**:
- `username`: Unique login name
- `password_hash`: bcrypt hash (never store plain password)
- `role`: UserRole enum (admin, user, guest)
- `player_id`: Optional link to player profile

**Notes**:
- One user can have 0 or 1 player profile
- Admin users don't need player_id
- Regular users need player_id to register for tournaments

---

### players
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    city VARCHAR,
    year_of_birth INTEGER,
    rating FLOAT NOT NULL DEFAULT 1200,
    initial_rating FLOAT NOT NULL DEFAULT 1200,
    peak_rating FLOAT NOT NULL DEFAULT 1200,
    is_cms BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
```

**Purpose**: Player profiles and ratings

**Key Fields**:
- `id`: Primary key
- `name`: Full name (display)
- `first_name`, `last_name`: Separated for better queries
- `city`: Player's city
- `year_of_birth`: Birth year
- `rating`: Current rating (default 1200)
- `initial_rating`: Starting rating (usually 1200)
- `peak_rating`: Highest rating ever achieved
- `is_cms`: Whether player is a Candidate Master of Sport
- `created_at`, `updated_at`: Timestamps

**Notes**:
- 151 players imported from CSV data
- Rating updates happen via Match results
- Peak rating automatically tracked
- All users created with transliterated Ukrainian names

**Key Fields**:
- `name`: Full name (unique in practice, not enforced)
- `rating`: Current rating (changes with matches)
- `initial_rating`: Rating after calibration (for chart baseline)
- `peak_rating`: Highest rating ever achieved
- `is_cms`: Candidate Master of Sports (real title, not rating-based)

**Notes**:
- Rating NEVER NULL, always has value
- Default rating: 1200 (beginner)
- peak_rating tracks all-time high

---

### matches
```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    player1_id INTEGER REFERENCES players(id),
    player2_id INTEGER REFERENCES players(id),
    player1_score INTEGER NOT NULL,
    player2_score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    winner_id INTEGER REFERENCES players(id),
    player1_rating_before FLOAT NOT NULL,
    player2_rating_before FLOAT NOT NULL,
    player1_rating_after FLOAT NOT NULL,
    player2_rating_after FLOAT NOT NULL,
    player1_rating_change FLOAT NOT NULL,
    player2_rating_change FLOAT NOT NULL,
    date TIMESTAMP NOT NULL,
    tournament VARCHAR,
    stage VARCHAR,
    sequence_index INTEGER
);
```

**Purpose**: Match results and rating history

**Key Fields**:
- `player1_id`, `player2_id`: Participants
- `player1_score : player2_score`: Match score (e.g., 7:5)
- `max_score`: Playing to how many? (e.g., 7)
- `winner_id`: Who won
- `*_rating_before/after`: Snapshots for history
- `*_rating_change`: Delta (can be negative)
- `stage`: group, round16, quarterfinal, semifinal, final
- `sequence_index`: Order when multiple matches on same date

**Notes**:
- Rating changes calculated by backend
- Both players ALWAYS get rating change (zero-sum not enforced)
- Stage affects match weight (final worth more)

---

### tournaments
```sql
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR NOT NULL,  -- 'registration' | 'in_progress' | 'finished'
    registration_start TIMESTAMP,
    registration_end TIMESTAMP NOT NULL,
    start_date DATE,
    end_date DATE,
    started_at TIMESTAMP,
    finished_at TIMESTAMP,
    city VARCHAR NOT NULL,
    country VARCHAR NOT NULL DEFAULT 'Україна',
    club VARCHAR NOT NULL,
    discipline VARCHAR NOT NULL,  -- 'free_pyramid' | 'dynamic_pyramid' | etc.
    max_participants INTEGER,
    is_rated BOOLEAN NOT NULL DEFAULT TRUE,
    created_by_admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL
);
```

**Purpose**: Tournament metadata

**Key Fields**:
- `status`: Enum - registration, in_progress, finished (LOWERCASE in DB)
- `discipline`: Enum - free_pyramid, dynamic_pyramid, combined_pyramid, moscow_pyramid, nevsky_pyramid (LOWERCASE)
- `registration_start/end`: Time window for signups
- `start_date/end_date`: When tournament happens
- `max_participants`: Optional participant limit
- `is_rated`: Whether matches affect rating
- `created_by_admin_id`: Admin who created tournament

**CRITICAL NOTES**:
- **Enum values MUST be lowercase** in PostgreSQL
- Default status uses string `"registration"` not enum object
- Frontend sends uppercase ("FREE_PYRAMID") - backend validator converts to lowercase
- Created with Alembic migration `20260107094620_fix_enum_values.py`

---

### tournament_registrations
```sql
CREATE TABLE tournament_registrations (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    player_id INTEGER REFERENCES players(id),
    status VARCHAR NOT NULL,  -- 'pending' | 'confirmed' | 'rejected' | 'active' | 'eliminated'
    seed INTEGER,
    registered_at TIMESTAMP NOT NULL,
    confirmed_at TIMESTAMP,
    registered_by_user_id INTEGER REFERENCES users(id)
);
```

**Purpose**: Many-to-many link between tournaments and players

**Key Fields**:
- `tournament_id`, `player_id`: Who is in what tournament
- `status`: ParticipantStatus enum
  - `pending`: waiting for admin confirmation
  - `confirmed`: approved, ready to play
  - `rejected`: denied by admin
  - `active`: currently playing (Phase 2)
  - `eliminated`: knocked out (Phase 2)
- `seed`: Bracket position (1-32), determined by rating
- `registered_by_user_id`: NULL = self-registration, ID = admin added

**Notes**:
- User self-registration → status = 'pending'
- Admin add player → status = 'confirmed'
- Admin must confirm/reject pending registrations

---

## Enums

### UserRole
```python
class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
```

**Note**: GUEST role removed - authentication now required for most features.

### TournamentStatus
```python
class TournamentStatus(str, enum.Enum):
    REGISTRATION = "registration"      # Lowercase in DB
    IN_PROGRESS = "in_progress"        # Lowercase in DB
    FINISHED = "finished"              # Lowercase in DB
```

**CRITICAL**: PostgreSQL enum type stores lowercase values. Frontend sends uppercase ("REGISTRATION"), backend converts via field_validator. Model default must use string `"registration"` not enum object.

### ParticipantStatus
```python
class ParticipantStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    ACTIVE = "active"
    ELIMINATED = "eliminated"
```

### TournamentDiscipline
```python
class TournamentDiscipline(str, enum.Enum):
    FREE_PYRAMID = "free_pyramid"                      # Lowercase in DB
    FREE_PYRAMID_EXTENDED = "free_pyramid_extended"    # Lowercase in DB
    COMBINED_PYRAMID = "combined_pyramid"              # Lowercase in DB
    DYNAMIC_PYRAMID = "dynamic_pyramid"                # Lowercase in DB
    COMBINED_PYRAMID_CHANGES = "combined_pyramid_changes"  # Lowercase in DB
    MOSCOW_PYRAMID = "moscow_pyramid"                  # Lowercase in DB
    NEVSKY_PYRAMID = "nevsky_pyramid"                  # Lowercase in DB
```

**CRITICAL**: All values stored as lowercase in PostgreSQL. Frontend displays Ukrainian names ("Вільна піраміда"), sends uppercase enum names ("FREE_PYRAMID"), backend field_validator converts to lowercase ("free_pyramid"). Created with Alembic migration `20260107094620_fix_enum_values.py`.

---

## Relationships

### User → Player (0..1)
```python
# User model
player_id = Column(Integer, ForeignKey("players.id"), nullable=True)
player = relationship("Player", back_populates="user")

# Player model
user = relationship("User", back_populates="player", uselist=False)
```

### Tournament → User (creator)
```python
# Tournament model
created_by_admin_id = Column(Integer, ForeignKey("users.id"))
created_by = relationship("User")
```

### Tournament ↔ Player (many-to-many via registrations)
```python
# Tournament model
registrations = relationship("TournamentRegistration", back_populates="tournament")

# Player model
tournament_registrations = relationship("TournamentRegistration", back_populates="player")

# TournamentRegistration model
tournament = relationship("Tournament", back_populates="registrations")
player = relationship("Player", back_populates="tournament_registrations")
```

---

## Indexes

- `users.username` (unique)
- `users.player_id`
- `players.id` (primary key, auto-indexed)
- `matches.player1_id`, `matches.player2_id`
- `tournaments.id` (primary key)
- `tournament_registrations.tournament_id`
- `tournament_registrations.player_id`

---

## Constraints

1. **users.username** UNIQUE
2. **users.player_id** nullable (admin users don't need it)
3. **players.rating** NOT NULL (always has value)
4. **matches.winner_id** must be player1_id or player2_id
5. **tournament_registrations** UNIQUE(tournament_id, player_id) (not enforced in code, checked in business logic)

---

## Data Migration

### Current Strategy
- SQLAlchemy auto-creates tables on startup
- Manual migration scripts in `backend/scripts/`
- Example: `migrate_tournaments.py` added new columns

### Future Recommendation
- Use Alembic for proper migrations
- Track schema versions
- Support rollback

---

## Sample Data

### User (Admin)
```json
{
  "id": 1,
  "username": "admin",
  "password_hash": "$2b$12$...",
  "role": "admin",
  "player_id": null
}
```

### User (Player)
```json
{
  "id": 2,
  "username": "maksim",
  "password_hash": "$2b$12$...",
  "role": "user",
  "player_id": 782
}
```

### Player
```json
{
  "id": 782,
  "name": "Максим Росул",
  "city": "Ужгород",
  "rating": 1747.0,
  "initial_rating": 1200.0,
  "peak_rating": 1850.0,
  "is_cms": false
}
```

### Tournament
```json
{
  "id": 1,
  "name": "Кубок Закарпаття 2026",
  "status": "registration",
  "registration_end": "2026-02-01T23:59:59",
  "city": "Ужгород",
  "country": "Україна",
  "club": "Більярдний клуб Champion",
  "discipline": "FREE_PYRAMID",
  "is_rated": 1
}
```

### TournamentRegistration
```json
{
  "id": 1,
  "tournament_id": 1,
  "player_id": 782,
  "status": "pending",
  "registered_at": "2026-01-06T12:00:00",
  "registered_by_user_id": null
}
```

---

## Database Connection

### Local Development
```
postgresql://maxrosul:password@localhost:5432/billiard_rating
```

### Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:port/dbname
```

### Connection Pool
- SQLAlchemy default pool
- Max connections: 10 (can configure)

---

## Backup Strategy

1. Export to CSV (backend/scripts/export_csv.py)
2. PostgreSQL dump: `pg_dump billiard_rating > backup.sql`
3. JSON exports in backend/matches_export.json

---

## Common Queries

### Get top 10 players by rating
```sql
SELECT name, rating 
FROM players 
ORDER BY rating DESC 
LIMIT 10;
```

### Get player match history
```sql
SELECT m.date, m.player1_score, m.player2_score, m.player1_rating_change
FROM matches m
WHERE m.player1_id = 782 OR m.player2_id = 782
ORDER BY m.date DESC;
```

### Get tournament participants (confirmed only)
```sql
SELECT p.name, p.rating, tr.seed
FROM tournament_registrations tr
JOIN players p ON tr.player_id = p.id
WHERE tr.tournament_id = 1 
  AND tr.status = 'confirmed'
ORDER BY tr.seed ASC;
```

### Count pending registrations for admin
```sql
SELECT COUNT(*)
FROM tournament_registrations
WHERE tournament_id = 1 
  AND status = 'pending';
```
