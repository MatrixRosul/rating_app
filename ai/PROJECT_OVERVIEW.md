# Project Overview

## What Is This?

**Billiard Rating System** — веб-додаток для управління рейтингом гравців у більярд (піраміда) та проведення турнірів.

Основна мета: 
- Зберігати рейтинги гравців (система як у Codeforces)
- Організовувати турніри з автоматичним розрахунком рейтингу
- Відстежувати історію матчів
- Надавати статистику та графіки

## Core Entities

### 1. Players (Гравці)
- Ім'я, місто, рік народження
- Поточний рейтинг
- Історія матчів
- Пік рейтингу (найвищий досягнутий)

### 2. Tournaments (Турніри)
- Назва, опис, місто, клуб
- Дисципліна (FREE_PYRAMID, DYNAMIC_PYRAMID, etc.)
- Статус: registration, in_progress, finished
- Дати: початок/кінець реєстрації, початок/кінець турніру
- Учасники з різними статусами

### 3. Matches (Матчі)
- Два гравці
- Рахунок (player1Score : player2Score)
- Зміна рейтингу для обох
- Дата, стадія турніру (group, quarterfinal, final, etc.)
- Вага матчу (1.0 - 2.0 залежно від стадії)

### 4. Users (Користувачі)
- Username, password
- Role: ADMIN / USER
- Опційно прив'язані до Player (якщо гравець хоче сам реєструватись)

### 5. Ratings (Рейтинги)
- Новачок (Newbie): 0-1199 (сірий)
- Учень (Pupil): 1200-1399 (зелений)
- Спеціаліст (Specialist): 1400-1599 (блакитний)
- Експерт (Expert): 1600-1899 (синій)
- Кандидат у Майстри (Candidate Master): 1900-2099 (фіолетовий)
- Майстер (Master): 2100-2299 (помаранчевий)
- Міжнародний Майстер (International Master): 2300-2399 (помаранчевий)
- Гросмейстер (Grandmaster): 2400+ (червоний)

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Context (Auth, App)
- **Charts**: Custom SVG (RatingChart)
- **Routing**: App Router with dynamic routes

### Backend
- **Framework**: FastAPI (Python 3.12)
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL 17.6
- **Auth**: JWT tokens (python-jose), bcrypt
- **Validation**: Pydantic v2
- **Migrations**: Alembic 1.13.1

### Database
- **PostgreSQL** (local + Heroku production)
- Migrations: Alembic (managed via alembic/)
- 151 players imported from CSV
- 151 user accounts created with transliterated usernames

### Deployment
- **Frontend**: Vercel (auto-deploy from GitHub) - https://rating-app-mu-murex.vercel.app
- **Backend**: Heroku - https://rating-app-000c25dfc4f1.herokuapp.com
- **Database**: Heroku PostgreSQL 17.6 (postgresql-cylindrical-32177)

## Key Features

### Phase 1: Tournament Registration ✅ DONE
- Create tournaments with registration deadlines
- User self-registration (status: PENDING)
- Admin confirmation/rejection
- Admin can add players directly (status: CONFIRMED)
- Admin can create new players on-the-fly
- Countdown timer to registration end
- Player list with rating colors

### Phase 2: Tournament Brackets (PLANNED)
- Generate brackets based on seeding
- Single/double elimination
- Display match tree
- Update results

### Phase 3: Live Tournaments (PLANNED)
- Real-time score updates
- Live bracket changes
- Notifications

### Phase 4: Statistics & Analytics (PLANNED)
- Player head-to-head stats
- Tournament history
- Advanced charts

## User Roles

### ADMIN
- Create/edit/delete tournaments
- Manage participants (confirm/reject/remove)
- Create new players
- Edit match results
- Recalculate ratings

### USER
- View tournaments
- Self-register for tournaments (requires player profile)
- View own match history
- View ratings and leaderboard

### GUEST (no login)
- View public leaderboard
- View tournament list
- View player profiles (read-only)

## Important Design Decisions

1. **Frontend = UI only**
   - No business logic
   - All calculations on backend
   - Frontend just displays data

2. **Rating System**
   - Based on ELO with pyramid-specific adjustments
   - K-factor depends on games played
   - Stage multipliers (final worth more than group)
   - Underdog bonus for big upsets
   - Loss protection for beginners

3. **Tournament Flow**
   - Registration phase (users can join)
   - Admin confirms participants
   - Seeding by rating
   - Bracket generation
   - Matches played
   - Rating updates after completion

4. **Data Flow**
   - Frontend → API (snake_case JSON)
   - Frontend maps to camelCase internally
   - Backend validates everything
   - No trust in frontend data

## Project Structure

```
/ratingAPP
├── frontend/          # Next.js app
│   └── src/
│       ├── app/       # Pages (App Router)
│       ├── components/# React components
│       ├── context/   # Auth, App state
│       ├── types/     # TypeScript interfaces
│       └── utils/     # Rating helpers
│
├── backend/           # FastAPI app
│   ├── app/
│   │   ├── models/    # SQLAlchemy models
│   │   ├── routers/   # API endpoints
│   │   ├── services/  # Business logic
│   │   ├── schemas/   # Pydantic schemas
│   │   ├── utils/     # Helpers
│   │   └── tests/     # Pytest tests
│   ├── scripts/       # Utility scripts (user creation, CSV import)
│   └── alembic/       # Database migrations
│
├── ai/                # AI documentation (this folder)
└── data/              # CSV imports, backups
```

## Current State (January 2026)

✅ **Completed**:
- Player management (CRUD) - 151 players imported
- User accounts - 151 users created with Ukrainian→Latin transliteration
- Match history tracking
- Rating calculations v3.1.1 (Codeforces-style)
- User authentication (JWT with bcrypt)
- Tournament CRUD with enum-based disciplines
- Tournament registration system with statuses
- Participant management (6 endpoints)
- Admin player creation on-the-fly
- Countdown timers for registration
- Rating-based colors (gray→red)
- Database migrations with Alembic
- Production deployment (Vercel + Heroku)
- PostgreSQL enum types (lowercase values)

🚧 **In Progress**:
- Phase 2: Bracket generation and seeding
- Tournament start service

📋 **Planned**:
- Phase 3: Live tournaments with real-time updates
- Phase 4: Advanced statistics and analytics

## Next Steps for AI

Read these files in order:
1. `ARCHITECTURE.md` — understand how everything connects
2. `DATABASE.md` — learn the data models
3. `BACKEND.md` — backend implementation details
4. `FRONTEND.md` — frontend structure
5. `AUTH_AND_ROLES.md` — permissions system
6. `BUSINESS_LOGIC.md` — rating algorithm
7. `DEPLOYMENT.md` — how to deploy

After reading all files, you'll be able to:
- Fix bugs precisely
- Add features cleanly
- Understand rating calculations
- Navigate codebase
- Suggest improvements
