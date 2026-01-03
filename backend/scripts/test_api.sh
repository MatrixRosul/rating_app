#!/bin/bash
# Test tournament creation through API

echo "🧪 Тестування створення турніру через API"
echo

# 1. Login
echo "1️⃣ Авторизація admin..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

if [ -z "$TOKEN" ]; then
  echo "❌ Помилка авторизації"
  exit 1
fi

echo "✅ Успішно авторизовано"
echo

# 2. Create tournament
echo "2️⃣ Створення турніру через API..."
CREATE_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/tournaments/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Тест API Турнір 2026",
    "description": "Тестування через bash скрипт",
    "start_date": "2026-04-01",
    "end_date": "2026-04-02",
    "city": "Одеса",
    "country": "Україна",
    "club": "Морський клуб",
    "discipline": "DYNAMIC_PYRAMID"
  }')

echo "$CREATE_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if 'id' in data:
        print('✅ Турнір створено успішно!')
        print(f'   ID: {data[\"id\"]}')
        print(f'   Назва: {data[\"name\"]}')
        print(f'   Місто: {data[\"city\"]}')
        print(f'   Клуб: {data[\"club\"]}')
        print(f'   Дисципліна: {data[\"discipline\"]}')
    else:
        print('❌ Помилка створення турніру')
        print(json.dumps(data, indent=2, ensure_ascii=False))
except Exception as e:
    print(f'❌ Помилка: {e}')
    sys.exit(1)
"

echo
echo "3️⃣ Перевірка списку турнірів..."
curl -s "http://localhost:8000/api/tournaments/" | python3 -c "
import sys, json
tournaments = json.load(sys.stdin)
print(f'✅ Всього турнірів: {len(tournaments)}')
print()
print('Останні 3 турніри:')
for t in tournaments[:3]:
    print(f'  • {t[\"name\"]} - {t[\"city\"]}, {t[\"club\"]} ({t[\"discipline\"]})')
"

echo
echo "✅ Тестування завершено!"
