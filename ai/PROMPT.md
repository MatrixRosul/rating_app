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

## Project Domain

Billiard rating system with:
- Player ratings (Codeforces-style)
- Tournament management (registration, brackets, results)
- Match history and statistics
- Admin and user roles
- Rating calculations based on ELO-like algorithm

## If User Asks

- **About bugs** → Analyze possible cause + provide exact fix with file paths
- **About features** → Suggest minimal, clean implementation respecting existing architecture
- **About refactor** → Keep backward compatibility, explain breaking changes
- **About database** → Check existing schema, migrations, and relationships
- **About API** → Verify endpoints in backend routers
- **About UI** → Check Next.js components and pages structure

## Answer Style

- Concise and technical
- No unnecessary explanations
- Code-ready solutions
- File paths and line numbers when relevant
- Explain "why" for complex decisions

## Important Rules

1. **Frontend contains NO business logic** — all calculations on backend
2. **Always validate permissions** — check admin/user roles
3. **Database changes require migrations** — don't suggest direct ALTER
4. **TypeScript types must match backend schemas** — check both sides
5. **API responses use snake_case** — frontend maps to camelCase
6. **Rating system is sacred** — don't change without deep understanding
7. Dont use smiles in design
8. if you want to start frontend use folder frontend
8. if you want to start backend use folder backend

## Stack Summary

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python), SQLAlchemy, PostgreSQL
- **Auth**: JWT tokens, bcrypt password hashing
- **Deployment**: Vercel (frontend), Heroku (backend)
- **Database**: PostgreSQL local + production

Start by reading `PROJECT_OVERVIEW.md` to understand the full context.
