#!/usr/bin/env python3
"""
Create user accounts for all players in the database
Generates username from player name (e.g. "Максим Росул" -> "maksym_rosul")
and random 8-character password
"""
import sys
import os
import random
import string

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.player import Player
from app.auth import get_password_hash


# Транслітерація українських літер
TRANSLIT_MAP = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu',
    'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye',
    'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L',
    'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
    'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu',
    'Я': 'Ya'
}


def translit(text):
    """Транслітерація українського тексту"""
    result = []
    for char in text:
        if char in TRANSLIT_MAP:
            result.append(TRANSLIT_MAP[char])
        else:
            result.append(char)
    return ''.join(result)


def generate_username(player_name):
    """
    Генерує username з імені гравця
    "Максим Росул" -> "maksym_rosul"
    """
    # Транслітеруємо
    translited = translit(player_name)
    
    # Перетворюємо на нижній регістр
    username = translited.lower()
    
    # Замінюємо пробіли на підкреслення
    username = username.replace(' ', '_')
    
    # Видаляємо всі символи крім букв, цифр та підкреслення
    username = ''.join(c for c in username if c.isalnum() or c == '_')
    
    return username


def generate_password(length=8):
    """Генерує випадковий пароль"""
    # Використовуємо букви та цифри
    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for _ in range(length))
    return password


def create_users_for_players():
    """Створює користувачів для всіх гравців"""
    db = SessionLocal()
    
    try:
        # Отримуємо всіх гравців
        players = db.query(Player).all()
        
        print(f"📊 Знайдено гравців: {len(players)}")
        print(f"🔐 Генеруємо користувачів...\n")
        
        created_count = 0
        skipped_count = 0
        credentials = []  # Список логінів та паролів
        
        for player in players:
            # Генеруємо username
            username = generate_username(player.name)
            
            # Перевіряємо чи вже існує користувач з таким username
            existing_user = db.query(User).filter(User.username == username).first()
            
            if existing_user:
                print(f"⏭️  Пропущено: {player.name} (користувач '{username}' вже існує)")
                skipped_count += 1
                continue
            
            # Генеруємо пароль
            password = generate_password(8)
            
            # Створюємо користувача
            user = User(
                username=username,
                password_hash=get_password_hash(password),
                role=UserRole.USER,
                player_id=player.id
            )
            
            db.add(user)
            created_count += 1
            
            # Зберігаємо для виведення
            credentials.append({
                'name': player.name,
                'username': username,
                'password': password,
                'rating': int(player.rating)
            })
            
            print(f"✅ {player.name}")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
            print(f"   Rating: {int(player.rating)}\n")
        
        # Зберігаємо зміни
        db.commit()
        
        print(f"\n{'='*60}")
        print(f"✅ Створено користувачів: {created_count}")
        print(f"⏭️  Пропущено (вже існують): {skipped_count}")
        print(f"📊 Всього гравців: {len(players)}")
        print(f"{'='*60}\n")
        
        # Виводимо топ-5 за рейтингом
        if credentials:
            print("🏆 ТОП-5 ЗА РЕЙТИНГОМ:")
            top_5 = sorted(credentials, key=lambda x: x['rating'], reverse=True)[:5]
            for i, cred in enumerate(top_5, 1):
                print(f"\n{i}. {cred['name']} (Rating: {cred['rating']})")
                print(f"   Username: {cred['username']}")
                print(f"   Password: {cred['password']}")
        
        # Зберігаємо в файл для зручності
        output_file = "users_credentials.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("КОРИСТУВАЧІ ДЛЯ ГРАВЦІВ\n")
            f.write("=" * 80 + "\n\n")
            
            # Сортуємо за рейтингом
            sorted_creds = sorted(credentials, key=lambda x: x['rating'], reverse=True)
            
            for cred in sorted_creds:
                f.write(f"{cred['name']} (Rating: {cred['rating']})\n")
                f.write(f"Username: {cred['username']}\n")
                f.write(f"Password: {cred['password']}\n")
                f.write("-" * 80 + "\n")
        
        print(f"\n💾 Дані збережено у файл: {output_file}")
        
        return True
        
    except Exception as e:
        print(f"❌ Помилка: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_users_for_players()
