#!/usr/bin/env python3
"""
Reset passwords for specific users on Heroku and save credentials
"""
import sys
import os
import random
import string

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.user import User
from app.models.player import Player
from app.auth import get_password_hash


def generate_password(length=8):
    """Генерує випадковий пароль"""
    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for _ in range(length))
    return password


def reset_passwords():
    """Створює нові паролі для вказаних користувачів"""
    db = SessionLocal()
    
    # Користувачі для яких треба змінити паролі
    target_users = ['maksym_rosul', 'oleksandr_hrin']
    
    try:
        credentials = []
        
        for username in target_users:
            # Знаходимо користувача
            user = db.query(User).filter(User.username == username).first()
            
            if not user:
                print(f"❌ Користувача '{username}' не знайдено")
                continue
            
            # Отримуємо інформацію про гравця
            player = db.query(Player).filter(Player.id == user.player_id).first()
            
            # Генеруємо новий пароль
            new_password = generate_password()
            
            # Хешуємо пароль і оновлюємо в БД
            user.password_hash = get_password_hash(new_password)
            
            credentials.append({
                'username': username,
                'password': new_password,
                'player_name': player.name if player else 'Unknown',
                'rating': player.rating if player else 0
            })
            
            print(f"✅ Оновлено пароль для {player.name if player else username}")
        
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
        raise
    finally:
        db.close()


if __name__ == "__main__":
    reset_passwords()
