# Система Аутентифікації та Авторизації

## Огляд

Рейтингова система більярду підтримує 3 рівні доступу:

1. **Guest (Гість)** - Read-only доступ без логіну
2. **User (Користувач)** - Зареєстрований гравець
3. **Admin (Адміністратор)** - Повний доступ до керування

## Архітектура

### Backend (FastAPI)

- **JWT Tokens** - для аутентифікації
- **bcrypt** - для хешування паролів
- **Role-based access** - через декоратори dependencies

**Файли:**
- `app/models/user.py` - User model з ролями (GUEST/USER/ADMIN)
- `app/auth.py` - JWT utilities, password hashing
- `app/dependencies.py` - Auth decorators (@require_user, @require_admin)
- `app/routers/auth.py` - Login/logout endpoints

**API Endpoints:**
```
POST /api/auth/login/     - Логін (повертає JWT token)
GET  /api/auth/me/        - Інфо про поточного користувача
POST /api/auth/logout/    - Logout (клієнт видаляє token)
```

### Frontend (Next.js + React)

**Файли:**
- `src/context/AuthContext.tsx` - Глобальний auth state
- `src/components/LoginModal.tsx` - Форма логіну
- `src/app/layout.tsx` - AuthProvider wrapper

**LocalStorage:**
- `auth_token` - JWT токен зберігається в localStorage
- Перевіряється при завантаженні сторінки

## Створення Користувачів

### Скрипт для ініціалізації

```bash
cd /Users/maxrosul/ratingAPP/backend
source venv/bin/activate
python scripts/create_users.py
```

**Створюються:**
- 1 admin користувач
- 5 user користувачів (прив'язані до гравців з БД)

### Дефолтні паролі

⚠️ **ВАЖЛИВО:** Змініть паролі в продакшені!

```
Admin:  username='admin',    password='admin123'
Users:  username='<player>', password='player123'
```

**Приклади user логінів:**
- `андрій_сергєєв` / `player123`
- `андрій_банк` / `player123`
- `андрій_новицький` / `player123`
- та інші...

## Використання на Frontend

### useAuth Hook

```tsx
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { 
    user,           // AuthUser | null
    isAuthenticated,
    isLoading,
    login,          // (username, password) => Promise<void>
    logout,         // () => void
    isGuest,        // () => boolean
    isUser,         // () => boolean
    isAdmin,        // () => boolean
  } = useAuth();

  // Приклад: показати кнопку тільки для адміна
  if (isAdmin()) {
    return <button>Адмін функція</button>
  }

  // Приклад: різний UI для гостя
  if (isGuest()) {
    return <div>Увійдіть щоб побачити більше</div>
  }

  return <div>Привіт, {user?.username}!</div>
}
```

### Conditional Rendering по Ролях

```tsx
// Показати тільки для адмінів
{isAdmin() && <AdminPanel />}

// Показати тільки для користувачів (user або admin)
{isAuthenticated && <UserFeature />}

// Показати для гостей
{isGuest() && <GuestMessage />}
```

## Захист Backend Endpoints

### Приклад: тільки для користувачів

```python
from app.dependencies import require_user

@router.post("/api/matches/")
def create_match(
    match_data: dict,
    current_user: User = Depends(require_user)
):
    # Тільки залогінені користувачі можуть створювати матчі
    ...
```

### Приклад: тільки для адміна

```python
from app.dependencies import require_admin

@router.delete("/api/players/{player_id}/")
def delete_player(
    player_id: str,
    current_user: User = Depends(require_admin)
):
    # Тільки адміни можуть видаляти гравців
    ...
```

### Приклад: опціональна аутентифікація

```python
from app.dependencies import get_current_user_optional

@router.get("/api/players/")
def get_players(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    # Працює і для гостей, і для залогінених
    # Можна показувати різні дані в залежності від ролі
    if current_user and current_user.role == UserRole.ADMIN:
        # Показати додаткову інформацію для адміна
        ...
```

## Security Features

### JWT Token

- Алгоритм: HS256
- Експірація: 7 днів
- Зберігається в localStorage на клієнті
- Передається в заголовку: `Authorization: Bearer <token>`

### Password Hashing

- Використовується bcrypt
- Limit: 72 байти (автоматично обрізається)
- Salt генерується автоматично

### CORS

Backend налаштований на прийом запитів з:
- `http://localhost:3000` (frontend dev)
- Додати production URL при деплої

## Наступні Кроки (TODO)

### Базовий функціонал (наразі готово ✅)
- [x] JWT аутентифікація
- [x] User model з ролями
- [x] Login/logout
- [x] AuthContext на frontend
- [x] LoginModal компонент
- [x] Кнопка Login/Logout в навігації

### Розширення функціоналу (в планах)
- [ ] Зміна пароля користувачем
- [ ] Адмін панель для CRUD користувачів
- [ ] Permissions для редагування своїх даних (User)
- [ ] Адмін може додавати/видаляти матчі
- [ ] User може редагувати тільки свій профіль
- [ ] Password reset функціонал
- [ ] Email verification (опціонально)

## Тестування

### Тест логіну через curl

```bash
# Login as admin
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Отримаєте token:
{
  "access_token": "eyJhbGci...",
  "token_type": "bearer",
  "username": "admin",
  "role": "admin",
  "player_id": null
}

# Використання token для доступу
curl http://localhost:8000/api/auth/me/ \
  -H "Authorization: Bearer eyJhbGci..."
```

### Тест на Frontend

1. Відкрийте http://localhost:3000
2. Натисніть "Увійти" в правому верхньому куті
3. Введіть `admin` / `admin123`
4. Після успішного входу побачите ім'я користувача та "👑 Admin"
5. Натисніть "Вийти" для logout

## Deployment

⚠️ Перед деплоєм на продакшен:

1. **Зміни паролі** всіх користувачів
2. **Зміни SECRET_KEY** в `app/auth.py` (перенеси в .env)
3. **Додай CORS origins** для production домену
4. **Використай HTTPS** для передачі токенів
5. **Налаштуй rate limiting** для /login endpoint

### Environment Variables

```bash
# Backend
SECRET_KEY=your-production-secret-key-here
DATABASE_URL=postgresql://user:pass@host:5432/db

# Frontend
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```
