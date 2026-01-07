# AI Assistant Instructions

You are an AI assistant working with the Billiard Rating System project.

## Your Task

- Fully understand the project based on the provided documentation in `/ai` folder
- Treat this as a production-ready system
- Do NOT invent missing logic — ask or infer only from documentation
- Give precise, technical, implementation-ready answers
- Assume the project is actively developed

## Before Answering Any Question

1. Read `PROJECT_OVERVIEW.md` for general context
2. Use `ARCHITECTURE.md` to understand structure
3. Check `DATABASE.md` for data models
4. Respect existing backend/frontend contracts
5. Review `BACKEND.md` and `FRONTEND.md` for implementation details
6. Consider `AUTH_AND_ROLES.md` for permissions
7. Understand `BUSINESS_LOGIC.md` for rating calculations and tournament rules
8. Check `TROUBLESHOOTING.md` for known issues and solutions

## Project Domain

Billiard rating system with:
- Player ratings (Codeforces-style with 8 tiers)
- Tournament management (registration, brackets, results)
- Match history and statistics
- Admin and user roles
- Rating calculations based on ELO-like algorithm
- 151 players with automated user accounts
- Production deployment on Vercel + Heroku

## If User Asks

- **About bugs** → Check TROUBLESHOOTING.md first, analyze cause + provide exact fix with file paths
- **About features** → Suggest minimal, clean implementation respecting existing architecture
- **About refactor** → Keep backward compatibility, explain breaking changes
- **About database** → Check existing schema, use Alembic migrations for changes
- **About API** → Verify endpoints in backend routers
- **About UI** → Check Next.js components and pages structure
- **About deployment** → Refer to DEPLOYMENT.md for Heroku/Vercel specifics
- **About enums** → ALWAYS use lowercase values, never uppercase (critical!)

## Answer Style

- Concise and technical
- No unnecessary explanations
- Code-ready solutions
- File paths and line numbers when relevant
- Explain "why" for complex decisions

## Important Rules

1. **Frontend contains NO business logic** — all calculations on backend
2. **Always validate permissions** — check admin/user roles
3. **Database changes require Alembic migrations** — don't suggest direct ALTER
4. **TypeScript types must match backend schemas** — check both sides
5. **API responses use snake_case** — frontend maps to camelCase
6. **Rating system is sacred** — don't change without deep understanding
7. **PostgreSQL enums MUST be lowercase** — "registration" not "REGISTRATION"
8. **Always restart Heroku dyno after deployment** — Python module caching
9. **Check backend logs first** — CORS errors often mask 500 errors
10. Don't use emojis in design
11. If you want to start frontend use folder `frontend/`
12. If you want to start backend use folder `backend/`

## Stack Summary

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python 3.12), SQLAlchemy 2.0, PostgreSQL 17.6, Alembic 1.13.1
- **Auth**: JWT tokens (python-jose), bcrypt password hashing
- **Deployment**: Vercel (frontend), Heroku (backend + database)
- **Database**: PostgreSQL local + Heroku production (postgresql-cylindrical-32177)

## Critical Lessons (Read TROUBLESHOOTING.md)

1. **Enum values lowercase** — Database expects "registration", not "REGISTRATION"
2. **Enum defaults as strings** — Use `default="registration"`, not `default=TournamentStatus.REGISTRATION`
3. **Field validators for enums** — Convert frontend uppercase to backend lowercase
4. **Restart after deployment** — `heroku restart` to clear Python cache
5. **Heroku filesystem ephemeral** — Save credentials during `heroku run` immediately

Start by reading `PROJECT_OVERVIEW.md` to understand the full context.
