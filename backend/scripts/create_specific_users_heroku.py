#!/usr/bin/env python3
"""
Create user accounts for specific players on Heroku
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


def generate_password(length=8):
    """Генерує випадковий пароль"""
    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for _ in range(length))
    return password


def create_specific_users():
    """Створює користувачів для конкретних гравців"""
    db = SessionLocal()
    
    # Користувачі які треба створити
    target_players = [
        {'name': 'Максим Росул', 'username': 'maksym_rosul'},
        {'name': 'Олександр Грін', 'username': 'oleksandr_hrin'}
    ]
    
    try:
        credentials = []
        
        for target in target_players:
            # Перевіряємо чи існує користувач
            existing_user = db.query(User).filter(User.username == target['username']).first()
            if existing_user:
                print(f"⏭️  Користувач '{target['username']}' вже існує")
                continue
            
            # Знаходимо гравця
            player = db.query(Player).filter(Player.name == target['name']).first()
            
            if not player:
                print(f"❌ Гравця '{target['name']}' не знайдено в БД")
                continue
            
            # Генеруємо пароль
            password = generate_password()
            
            # Створюємо користувача
            new_user = User(
                username=target['username'],
                password_hash=get_password_hash(password),
                role=UserRole.USER,
                player_id=player.id
            )
            
            db.add(new_user)
            
            credentials.append({
                'username': target['username'],
                'password': password,
                'player_name': player.name,
                'rating': player.rating
            })
            
            print(f"✅ Створено користувача для {player.name}")
        
        # Зберігаємо зміни
        db.commit()
        
        # Виводимо креденшели
        print("\n" + "="*80)
        print("НОВІ КРЕДЕНШЕЛИ ДЛЯ HEROKU")
        print("="*80 + "\n")
        
        for cred in credentials:
            print(f"{cred['player_name']} (Rating: {cred['rating']})")
            print(f"Username: {cred['username']}")
            print(f"Password: {cred['password']}")
            print("-" * 80)
        
        # Зберігаємо у файл
        output_file = os.path.join(os.path.dirname(__file__), '..', 'heroku_passwords_new.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("НОВІ КРЕДЕНШЕЛИ ДЛЯ HEROKU\n")
            f.write("="*80 + "\n\n")
            for cred in credentials:
                f.write(f"{cred['player_name']} (Rating: {cred['rating']})\n")
                f.write(f"Username: {cred['username']}\n")
                f.write(f"Password: {cred['password']}\n")
                f.write("-" * 80 + "\n")
        
        print(f"\n💾 Креденшели збережено у файл: {output_file}")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Помилка: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_specific_users()
