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
- Новачок: 0-1199 (сірий)
- Учень: 1200-1399 (зелений)
- Спеціаліст: 1400-1599 (блакитний)
- Експерт: 1600-1799 (синій)
- Кандидат у Майстри: 1800-2299 (фіолетовий)
- Майстер: 2300-2499 (помаранчевий)
- Гросмейстер: 2500+ (червоний)

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
- **ORM**: SQLAlchemy
- **Database**: PostgreSQL
- **Auth**: JWT tokens (python-jose), bcrypt
- **Validation**: Pydantic v2

### Database
- **PostgreSQL** (local + production)
- Migrations: manual scripts (SQLAlchemy auto-creates tables)

### Deployment
- **Frontend**: Vercel (auto-deploy from GitHub)
- **Backend**: Heroku or similar (manual deploy)

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
│   └── app/
│       ├── models/    # SQLAlchemy models
│       ├── routers/   # API endpoints
│       ├── services/  # Business logic
│       ├── schemas/   # Pydantic schemas
│       └── tests/     # Pytest tests
│
├── ai/                # AI documentation (this folder)
└── data/              # CSV imports, backups
```

## Current State (January 2026)

✅ **Completed**:
- Player management (CRUD)
- Match history
- Rating calculations v3.1.1
- User authentication (JWT)
- Tournament CRUD
- Tournament registration system
- Participant management (6 endpoints)
- Admin player creation
- Countdown timers
- Rating-based colors

🚧 **In Progress**:
- Phase 2: Bracket generation

📋 **Planned**:
- Phase 3: Live tournaments
- Phase 4: Statistics

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
