# Deployment Guide

## Overview

- **Frontend**: Vercel (auto-deploy from GitHub)
- **Backend**: Heroku or similar (manual deploy)
- **Database**: PostgreSQL (Heroku add-on or separate)

---

## Frontend Deployment (Vercel)

### Initial Setup

1. **Connect GitHub Repository**
   - Go to https://vercel.com
   - Click "New Project"
   - Import from GitHub
   - Select repository: `MatrixRosul/rating_app`

2. **Configure Project**
   - Framework Preset: Next.js
   - Root Directory: `frontend/`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.herokuapp.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes
   - Site live at: `https://rating-app-mu-murex.vercel.app`

### Auto-Deploy

Every push to `main` or `dev` branch triggers:
1. Vercel detects commit
2. Runs `npm run build`
3. Deploys new version
4. Updates live site

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

### Vercel Configuration

**vercel.json** (in project root):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

---

## Backend Deployment (Heroku)

### Initial Setup

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI
   brew install heroku
   
   # Login
   heroku login
   
   # Create app
   heroku create billiard-rating-api
   ```

2. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set SECRET_KEY=your-secret-key-here
   heroku config:set FRONTEND_URL=https://rating-app-mu-murex.vercel.app
   ```

4. **Configure Python Runtime**
   
   **runtime.txt** (in backend/):
   ```
   python-3.12.0
   ```

5. **Procfile** (in project root):
   ```
   web: cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

6. **Requirements**
   
   Make sure `backend/requirements.txt` includes:
   ```
   fastapi
   uvicorn
   sqlalchemy
   psycopg2-binary
   python-jose
   passlib
   pydantic
   ```

### Deploy Backend

```bash
# Add Heroku remote
git remote add heroku https://git.heroku.com/billiard-rating-api.git

# Deploy
git push heroku main

# Or from dev branch
git push heroku dev:main
```

### Database Setup on Heroku

1. **Get Database URL**
   ```bash
   heroku config:get DATABASE_URL
   ```

2. **Tables Auto-Created**
   - FastAPI app creates tables on startup
   - Check logs: `heroku logs --tail`

3. **Create Admin User**
   ```bash
   # SSH into Heroku
   heroku run bash
   
   # Inside Heroku container
   cd backend
   python scripts/create_admin.py
   ```

### Scaling

```bash
# Check current dynos
heroku ps

# Scale up
heroku ps:scale web=1

# Upgrade dyno type
heroku dyno:type hobby
```

---

## Database Management

### Local → Production Migration

1. **Export Local Data**
   ```bash
   cd backend
   pg_dump billiard_rating > backup.sql
   ```

2. **Import to Heroku**
   ```bash
   heroku pg:psql < backup.sql
   ```

### Backup Heroku Database

```bash
# Create backup
heroku pg:backups:capture

# Download backup
heroku pg:backups:download

# Restore from backup
heroku pg:backups:restore
```

### Direct Database Access

```bash
# Connect to Heroku PostgreSQL
heroku pg:psql

# Run SQL commands
SELECT COUNT(*) FROM players;
SELECT * FROM users WHERE role = 'admin';
```

---

## Environment Variables

### Local Development

**Backend (.env)**:
```bash
DATABASE_URL=postgresql://maxrosul:password@localhost:5432/billiard_rating
SECRET_KEY=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production

**Backend (Heroku)**:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname  # Auto-set by addon
SECRET_KEY=production-secret-key-very-long-and-random
FRONTEND_URL=https://rating-app-mu-murex.vercel.app
```

**Frontend (Vercel)**:
```bash
NEXT_PUBLIC_API_URL=https://billiard-rating-api.herokuapp.com
```

---

## CORS Configuration

**Backend (app/main.py)**:
```python
allowed_origins = [
    "http://localhost:3000",        # Local dev
    "http://localhost:3001",        # Backup port
    "https://rating-app-mu-murex.vercel.app",  # Production
    os.getenv("FRONTEND_URL", ""),  # From env var
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in allowed_origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## SSL/HTTPS

### Vercel
- ✅ Automatic HTTPS
- ✅ Free SSL certificate
- ✅ Auto-renews

### Heroku
- ✅ Automatic HTTPS (on *.herokuapp.com)
- ✅ Free SSL for Heroku domains
- ⬜ Custom domain requires ACM (Automated Certificate Management)

---

## Monitoring & Logs

### Vercel

**View Logs**:
- Dashboard → Project → Deployments → Click deployment → Runtime Logs

**Analytics**:
- Dashboard → Project → Analytics
- Page views, visitors, performance

### Heroku

**View Logs**:
```bash
# Real-time logs
heroku logs --tail

# Last 100 lines
heroku logs -n 100

# Filter by source
heroku logs --source app
```

**Metrics**:
```bash
heroku metrics
```

**Application Performance Monitoring**:
- Add-on: New Relic, Datadog, Sentry

---

## Troubleshooting

### Frontend Build Fails

**Error**: `Module not found`

**Solution**:
1. Check `package.json` dependencies
2. Verify import paths (case-sensitive)
3. Clear Vercel cache: Redeploy

**Error**: `Environment variable not set`

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_API_URL`
3. Redeploy

### Backend Crashes

**Error**: `Application error`

**Check logs**:
```bash
heroku logs --tail
```

**Common issues**:
1. **Database connection failed**
   - Check `DATABASE_URL` is set
   - Verify PostgreSQL addon active

2. **Port binding failed**
   - Use `$PORT` environment variable
   - Command: `--port $PORT`

3. **Module import error**
   - Check `requirements.txt` complete
   - Run: `heroku run pip list`

### Database Issues

**Error**: `Relation does not exist`

**Solution**:
- Tables not created
- Restart app: `heroku restart`
- Check logs for auto-creation

**Error**: `Connection pool exhausted`

**Solution**:
- Too many connections
- Upgrade database plan
- Or add connection pooling (pgBouncer)

---

## Performance Optimization

### Frontend

1. **Enable Caching**
   - Vercel auto-caches static assets
   - Cache API responses (React Query)

2. **Image Optimization**
   - Use `next/image` component
   - Automatic WebP conversion

3. **Code Splitting**
   - Next.js does this automatically
   - Dynamic imports for heavy components

### Backend

1. **Database Indexes**
   - Index foreign keys
   - Index commonly queried fields

2. **Query Optimization**
   - Use `select_related()` / `joinedload()`
   - Avoid N+1 queries

3. **Caching** (future)
   - Redis for leaderboard
   - Cache tournament lists

---

## Cost Breakdown

### Free Tier (Development)

- **Vercel**: Free
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic SSL

- **Heroku**: Free (old accounts)
  - Hobby dynos sleep after 30 min inactivity
  - 550 free hours/month
  - PostgreSQL: 10,000 rows limit

### Paid Plans (Production)

- **Vercel Pro**: $20/month
  - Team features
  - More bandwidth
  - Priority support

- **Heroku Hobby**: $7/month
  - Dyno doesn't sleep
  - Metrics
  - PostgreSQL: Essential-0 ($5/month)

**Total**: ~$32/month for production-ready setup

---

## Deployment Checklist

### Before First Deploy

- [ ] Set all environment variables
- [ ] Test locally with production-like config
- [ ] Create admin user in production DB
- [ ] Verify CORS settings
- [ ] Check SECRET_KEY is random and secure
- [ ] Enable HTTPS everywhere

### For Each Deploy

- [ ] Run tests locally
- [ ] Check for breaking changes
- [ ] Update documentation
- [ ] Create git tag for version
- [ ] Deploy backend first (if API changes)
- [ ] Deploy frontend
- [ ] Smoke test production
- [ ] Monitor logs for errors

### Post-Deploy

- [ ] Verify login works
- [ ] Test tournament creation
- [ ] Check participant registration
- [ ] Verify rating calculations
- [ ] Test on mobile devices

---

## Rollback Procedure

### Frontend (Vercel)

1. Go to Deployments
2. Find previous working deployment
3. Click "Promote to Production"

### Backend (Heroku)

```bash
# View releases
heroku releases

# Rollback to previous
heroku rollback

# Or specific version
heroku rollback v123
```

---

## CI/CD Pipeline

### Current Setup

- **Manual Testing**
- **Git Push**
- **Auto-Deploy** (Vercel only)

### Future: GitHub Actions

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-python@v2
      - run: cd backend && pip install -r requirements.txt
      - run: cd backend && pytest

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: cd frontend && npm install
      - run: cd frontend && npm test
```

---

## Custom Domain Setup

### Vercel

1. Buy domain (e.g., billiardrating.com)
2. Go to Vercel → Settings → Domains
3. Add domain
4. Update DNS records (A, CNAME)
5. Wait for SSL certificate

### Heroku

1. Add domain:
   ```bash
   heroku domains:add www.billiardrating.com
   ```

2. Update DNS:
   - CNAME: `www` → `billiard-rating-api.herokuapp.com`

3. Enable SSL:
   - Automatic with ACM (Automated Certificate Management)

---

## Backup Strategy

1. **Daily Automatic Backups** (Heroku)
   ```bash
   heroku pg:backups:schedule --at '02:00 America/Los_Angeles'
   ```

2. **Weekly Manual Exports**
   - Export players, matches, tournaments to CSV
   - Store in GitHub repo or cloud storage

3. **Version Control**
   - All code in git
   - Tag releases

---

## Security Checklist

- [ ] HTTPS everywhere
- [ ] Environment variables not in git
- [ ] Strong SECRET_KEY
- [ ] Password hashing (bcrypt)
- [ ] SQL injection prevention (ORM)
- [ ] CORS whitelist specific origins
- [ ] Rate limiting (future)
- [ ] Regular dependency updates

---

## Useful Commands

```bash
# Frontend (Vercel)
vercel --prod                    # Deploy to production
vercel logs                      # View logs

# Backend (Heroku)
heroku logs --tail               # View logs
heroku restart                   # Restart app
heroku run bash                  # SSH into container
heroku pg:psql                   # Database console
heroku config                    # View env vars
heroku releases                  # View deploy history

# Database
heroku pg:backups:capture        # Create backup
heroku pg:backups:download       # Download backup
heroku pg:reset DATABASE_URL     # Reset database (DANGEROUS)

# Scaling
heroku ps:scale web=1            # Scale dynos
heroku dyno:type hobby           # Change dyno type
```

---

## Common Gotchas

1. **Heroku Dyno Sleep**
   - Free dynos sleep after 30 min
   - First request takes 10-30 seconds
   - Solution: Upgrade to Hobby ($7/month)

2. **DATABASE_URL Changes**
   - Heroku rotates credentials
   - Don't hardcode, use env var

3. **Build Path Issues**
   - Heroku deploys from root
   - Procfile must `cd backend`

4. **CORS Errors After Deploy**
   - Check frontend URL in allowed_origins
   - Verify FRONTEND_URL env var

5. **Frontend Can't Reach Backend**
   - Check NEXT_PUBLIC_API_URL
   - Must include https://

---

## Summary

- ✅ Frontend auto-deploys from GitHub (Vercel)
- ✅ Backend manually deployed (Heroku)
- ✅ Database hosted on Heroku PostgreSQL
- ✅ HTTPS automatic on both
- ✅ Environment variables separate per environment
- ✅ Logs accessible via CLI
- ✅ Rollback supported

**Deployment is simple**: Push to GitHub → Vercel builds → Production live in ~2 minutes
