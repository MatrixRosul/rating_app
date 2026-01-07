# AI Documentation - Billiard Rating System

This folder contains comprehensive documentation for AI assistants to understand and work with the project.

**Last Updated**: 7 січня 2026

---

## Quick Start

**Read these files in order**:

1. **PROJECT_OVERVIEW.md** - Start here! Understand what the system does
2. **ARCHITECTURE.md** - How everything connects
3. **DATABASE.md** - Data models and relationships
4. **BACKEND.md** - Python/FastAPI implementation
5. **FRONTEND.md** - Next.js/React structure
6. **AUTH_AND_ROLES.md** - User permissions and JWT
7. **BUSINESS_LOGIC.md** - Rating calculation algorithm
8. **DEPLOYMENT.md** - Heroku + Vercel setup
9. **TROUBLESHOOTING.md** - Solutions to common issues
10. **PROMPT.md** - AI assistant instructions

---

## Documentation Index

### Core Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| **PROJECT_OVERVIEW.md** | High-level overview, tech stack, current state | First thing to read |
| **ARCHITECTURE.md** | System design, data flow, file structure | Understanding how components interact |
| **DATABASE.md** | Schema, tables, enums, relationships | Working with data models |

### Implementation Guides

| File | Purpose | When to Read |
|------|---------|--------------|
| **BACKEND.md** | FastAPI structure, routers, services, scripts | Backend development |
| **FRONTEND.md** | Next.js pages, components, state management | Frontend development |
| **AUTH_AND_ROLES.md** | Authentication flow, JWT, permissions | User/admin features |
| **BUSINESS_LOGIC.md** | Rating algorithm, tournament rules | Understanding rating calculations |

### Operations

| File | Purpose | When to Read |
|------|---------|--------------|
| **DEPLOYMENT.md** | Deploy to Heroku/Vercel, environment setup | Deployment issues |
| **TROUBLESHOOTING.md** | Known issues and solutions | Debugging errors |
| **PROMPT.md** | AI assistant guidelines | AI context setup |

---

## Project Status (January 2026)

### ✅ Completed Features
- 151 players imported from CSV with full data
- 151 user accounts created with Ukrainian→Latin transliteration
- Tournament CRUD with 7 disciplines
- Tournament registration system (self-register + admin add)
- Participant management (confirm/reject/remove)
- Rating calculations (v3.1.1 - Codeforces-style)
- User authentication (JWT + bcrypt)
- Admin and user roles
- Production deployment (Vercel + Heroku)
- Database migrations (Alembic)
- PostgreSQL enum types (lowercase values)

### 🚧 In Progress
- Tournament bracket generation
- Seeding service by rating
- Tournament start logic

### 📋 Planned
- Live tournament updates
- Advanced statistics
- Player profiles editing
- Match result submission

---

## Critical Information

### Database
- **Local**: PostgreSQL (billiard_rating)
- **Production**: Heroku PostgreSQL 17.6 (postgresql-cylindrical-32177)
- **Migrations**: Alembic 1.13.1
- **Important**: All enum values are lowercase ("registration" not "REGISTRATION")

### Deployment
- **Frontend**: https://rating-app-mu-murex.vercel.app (Vercel)
- **Backend**: https://rating-app-000c25dfc4f1.herokuapp.com (Heroku)
- **Auto-deploy**: Frontend auto-deploys from GitHub main branch
- **Manual deploy**: Backend requires `git push heroku main`

### Known Issues (see TROUBLESHOOTING.md)
1. PostgreSQL enum types must be lowercase
2. Heroku Python module caching requires restart after deployment
3. CORS errors often mask 500 errors
4. Heroku filesystem is ephemeral (credentials not saved)
5. SQLAlchemy enum defaults must use strings, not enum objects

---

## Tech Stack Summary

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 3
- Deployment: Vercel

### Backend
- FastAPI (Python 3.12)
- SQLAlchemy 2.0
- Alembic 1.13.1
- PostgreSQL 17.6
- JWT Auth (python-jose)
- Password Hashing (bcrypt)
- Deployment: Heroku

### Development
- Git version control
- Pytest for backend tests
- VSCode recommended
- Python virtual environment

---

## Quick Reference

### Start Development
```bash
# Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm run dev
```

### Deploy
```bash
# Frontend (auto-deploys from GitHub)
git push origin main

# Backend
git push heroku main
heroku restart --app rating-app
```

### Database
```bash
# Run migrations
alembic upgrade head

# Connect to Heroku DB
heroku pg:psql
```

### Useful Commands
```bash
# Create admin user
python scripts/create_admin.py

# Create user accounts for all players
python scripts/create_users_for_players.py

# Check Heroku logs
heroku logs --tail

# Restart Heroku
heroku restart --app rating-app
```

---

## Getting Help

1. **Bug or error?** → Read TROUBLESHOOTING.md first
2. **Database question?** → Check DATABASE.md for schema
3. **API endpoint?** → See BACKEND.md for routers
4. **Frontend component?** → Check FRONTEND.md for structure
5. **Deployment issue?** → DEPLOYMENT.md has solutions
6. **Rating algorithm?** → BUSINESS_LOGIC.md explains calculations

---

## Contributing

When updating documentation:
1. Keep consistent formatting
2. Update "Last Updated" date
3. Add to TROUBLESHOOTING.md if solving a new issue
4. Update PROJECT_OVERVIEW.md "Current State" section
5. Keep examples accurate and tested

---

## File Locations

```
/ratingAPP/
├── ai/                    # THIS FOLDER - AI documentation
│   ├── README.md          # You are here
│   ├── PROJECT_OVERVIEW.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── BACKEND.md
│   ├── FRONTEND.md
│   ├── AUTH_AND_ROLES.md
│   ├── BUSINESS_LOGIC.md
│   ├── DEPLOYMENT.md
│   ├── TROUBLESHOOTING.md
│   └── PROMPT.md
│
├── backend/               # FastAPI application
├── frontend/              # Next.js application
├── data/                  # CSV files
└── scripts/               # Utility scripts
```

---

**Remember**: This documentation is for AI assistants. It should be comprehensive, technical, and implementation-focused.
