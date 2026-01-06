"""
Скрипт для створення тестового користувача прив'язаного до гравця
"""
import sys
from pathlib import Path

# Додаємо backend до Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.player import Player
from app.auth import get_password_hash

def create_test_user():
    db = SessionLocal()
    
    try:
        # Знайти гравця Максим Росул
        player = db.query(Player).filter(Player.name == 'Максим Росул').first()
        
        if not player:
            print('❌ Гравця "Максим Росул" не знайдено в базі')
            print('\nДоступні гравці:')
            players = db.query(Player).limit(20).all()
            for p in players:
                print(f'  - {p.name} (ID: {p.id}, Рейтинг: {p.rating})')
            return
        
        # Перевірити чи вже існує користувач
        existing_user = db.query(User).filter(User.username == 'maksim').first()
        
        if existing_user:
            print(f'ℹ️  Користувач maksim вже існує (ID: {existing_user.id})')
            print(f'Прив\'язаний до гравця: {player.name} (ID: {player.id})')
            print(f'Role: {existing_user.role}')
            return
        
        # Створити нового користувача
        new_user = User(
            username='maksim',
            hashed_password=get_password_hash('maksim123'),  # пароль: maksim123
            role=UserRole.USER,
            player_id=player.id
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        print('✅ Створено тестового користувача:')
        print(f'   Username: maksim')
        print(f'   Password: maksim123')
        print(f'   Role: USER')
        print(f'   Прив\'язаний до гравця: {player.name}')
        print(f'   Player ID: {player.id}')
        print(f'   Рейтинг гравця: {player.rating}')
        
    except Exception as e:
        print(f'❌ Помилка: {e}')
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    create_test_user()
