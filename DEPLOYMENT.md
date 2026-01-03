# Deployment Guide

## 🎯 Поточна Архітектура

- **Frontend**: Next.js на **Vercel**
- **Backend**: FastAPI на **Heroku** (`https://rating-app-000c25dfc4f1.herokuapp.com`)
- **Database**: PostgreSQL на Heroku

---

## ✅ Backend вже на Heroku

Backend вже задеплоєно та працює на Heroku!

**URL:** `https://rating-app-000c25dfc4f1.herokuapp.com`

### Перевірка що працює:

```bash
curl https://rating-app-000c25dfc4f1.herokuapp.com/health
```

Має повернути:
```json
{"status": "healthy"}
```

---

## 🚀 Деплой Frontend на Vercel

### Крок 1: Підключення GitHub до Vercel

1. Зайди на [vercel.com](https://vercel.com)
2. Натисни **"Add New Project"**
3. Авторизуйся через GitHub
4. Обери репозиторій `rating_app`

### Крок 2: Налаштування проєкту

**Framework Preset:** Next.js
**Root Directory:** `frontend`

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Крок 3: Environment Variables ⚠️ ВАЖЛИВО!

У Vercel → Settings → Environment Variables додай:

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://rating-app-000c25dfc4f1.herokuapp.com` |

**Важливо:** 
- Без trailing slash `/`
- Застосуй до Production, Preview, Development

### Крок 4: Deploy

Натисни **"Deploy"** - Vercel автоматично побудує та задеплоїть проєкт!

---

## 🔄 Автоматичний деплой

### Heroku (Backend)
```bash
git push heroku main
```

### Vercel (Frontend)
```bash
git push origin main
```

Vercel автоматично створює preview для кожного PR!

---

## 🛠️ Налаштування CORS на Backend

Backend вже налаштований для Vercel! 

У `backend/app/main.py`:
```python
allowed_origins = [
    "http://localhost:3000",
    "https://rating-app-frontend-tau.vercel.app",  # Заміни на свій домен
    os.getenv("FRONTEND_URL", ""),
]
```

**Після отримання Vercel домену:**

✅ **Вже зроблено для твого домену:** `https://rating-app-mu-murex.vercel.app`

Якщо потрібно змінити:

1. Відкрий `backend/app/main.py`
2. Заміни URL у `allowed_origins`
3. Commit та push:
```bash
git add backend/app/main.py
git commit -m "Update CORS for Vercel domain"
git push heroku main
```

Або встанови через env var:
```bash
heroku config:set FRONTEND_URL="https://rating-app-mu-murex.vercel.app" --app rating-app-000c25dfc4f1
```

---

## 🧪 Тестування після деплою

### 1. Перевірка Backend API

```bash
curl https://rating-app-000c25dfc4f1.herokuapp.com/health
```

Очікується:
```json
{"status":"healthy"}
```

### 2. Перевірка Frontend

1. Відкрий свій Vercel домен
2. Спробуй увійти (admin/admin123)
3. Перейди на сторінку турнірів
4. Створи новий турнір

### 3. Перевірка CORS

Відкрий Console (F12):
- ❌ Якщо `CORS policy` errors → оновити `allowed_origins`
- ✅ Якщо запити проходять → все працює!

---

## 📝 Як працює у коді

### Frontend (всі файли оновлені)

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

fetch(`${API_URL}/api/tournaments/`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data)
})
```

### Backend

CORS у `backend/app/main.py`:
```python
allowed_origins = [
    "http://localhost:3000",
    "https://rating-app-frontend-tau.vercel.app",
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

---

## 🆘 Troubleshooting

### ❌ CORS errors

**Рішення:**
1. Перевір `FRONTEND_URL` на Heroku
2. Перевір що домен точно співпадає
3. Редеплой: `git push heroku main`

### ❌ API повертає 404

**Рішення:**
1. Перевір `NEXT_PUBLIC_API_URL` у Vercel
2. Перевір що URL без `/`
3. Redeploy у Vercel

### ❌ Login не працює

**Рішення:**
1. Відкрий Console (F12) → Network tab
2. Перевір що запит йде на правильний URL
3. Перевір response (401/403/CORS)

---

## 📋 Checklist

- [ ] Backend доступний на Heroku
- [ ] Frontend деплоїться на Vercel
- [ ] `NEXT_PUBLIC_API_URL` встановлена
- [ ] CORS включає Vercel домен
- [ ] Тест логіну працює
- [ ] Тест створення турніру працює

---

## 🎯 Корисні команди

```bash
# Heroku
heroku logs --tail --app rating-app-000c25dfc4f1
heroku config --app rating-app-000c25dfc4f1
heroku restart --app rating-app-000c25dfc4f1

# Local test з production API
NEXT_PUBLIC_API_URL=https://rating-app-000c25dfc4f1.herokuapp.com npm run dev
```

---

## Старі інструкції (Render/Railway)

Нижче старі інструкції для інших платформ (залишені для довідки):
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
