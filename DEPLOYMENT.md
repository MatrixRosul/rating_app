# Deployment Guide

## Архітектура

- **Frontend**: Next.js на Vercel
- **Backend**: FastAPI на Render/Railway/Heroku
- **Database**: PostgreSQL (Render/Supabase/Neon)

## Крок 1: Deploy Backend

### Варіант A: Render.com (Рекомендовано)

1. Створи акаунт на [Render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Налаштування:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Залиш порожнім
5. Environment Variables:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
6. Deploy!
7. Скопіюй URL (наприклад `https://rating-app-backend.onrender.com`)

### Варіант B: Railway.app

1. Railway.app → New Project → Deploy from GitHub
2. Select repository → Deploy backend folder
3. Додай Environment Variable:
   ```
   DATABASE_URL=postgresql://...
   ```
4. Railway автоматично визначить Python і запустить

## Крок 2: Deploy Database

### Варіант A: Render PostgreSQL

1. Render Dashboard → New → PostgreSQL
2. Створи базу даних
3. Скопіюй Internal/External Database URL
4. Додай в Backend Environment Variables

### Варіант B: Supabase

1. [Supabase.com](https://supabase.com) → New Project
2. Database Settings → Connection String
3. Використай в Backend

## Крок 3: Migrate Database

Після deploy backend:

```bash
# Локально підключись до production БД
cd backend
export DATABASE_URL="postgresql://..."
source venv/bin/activate

# Створи таблиці
python -c "from app.database import Base, engine; Base.metadata.create_all(bind=engine)"

# Імпортуй дані з CSV (якщо потрібно)
python scripts/import_csv.py
```

## Крок 4: Deploy Frontend на Vercel

1. Vercel Dashboard → Import Project
2. Connect GitHub repository
3. Налаштування:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://rating-app-backend.onrender.com
   ```
5. Deploy!

## Локальна розробка

### Backend
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm run dev
```

Frontend буде використовувати `http://localhost:8000` якщо `NEXT_PUBLIC_API_URL` не встановлено.

## Troubleshooting

### "Failed to fetch" на Vercel
- Перевір що Backend задеплоєний і працює
- Перевір що `NEXT_PUBLIC_API_URL` встановлений в Vercel Environment Variables
- Перевір що Backend має CORS налаштований для Vercel domain

### CORS помилки
У `backend/app/main.py` додай Vercel domain:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app"  # Додай свій домен
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Production Checklist

- [ ] Backend задеплоєний на Render/Railway
- [ ] PostgreSQL база створена
- [ ] Таблиці створені в БД
- [ ] Дані імпортовані
- [ ] Backend URL додано в Vercel Environment Variables
- [ ] CORS налаштований для Vercel domain
- [ ] Frontend задеплоєний на Vercel
- [ ] Все працює ✅
