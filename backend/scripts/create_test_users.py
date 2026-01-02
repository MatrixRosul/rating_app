"""
Створення тестових користувачів для перевірки турнірів
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User, UserRole
from app.auth import get_password_hash

def create_test_users():
    """Створює тестових користувачів"""
    db = SessionLocal()
    
    try:
        # Перевіряємо чи є вже адмін
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                password_hash=get_password_hash("admin123"),
                role=UserRole.ADMIN,
                player_id=None
            )
            db.add(admin)
            print("✅ Створено адміністратора: admin / admin123")
        else:
            print("ℹ️  Адміністратор вже існує")
        
        # Створюємо тестових користувачів
        test_users = [
            ("user1", "user123", UserRole.USER),
            ("user2", "user123", UserRole.USER),
            ("user3", "user123", UserRole.USER),
            ("user4", "user123", UserRole.USER),
            ("user5", "user123", UserRole.USER),
        ]
        
        created_count = 0
        for username, password, role in test_users:
            existing = db.query(User).filter(User.username == username).first()
            if not existing:
                user = User(
                    username=username,
                    password_hash=get_password_hash(password),
                    role=role,
                    player_id=None
                )
                db.add(user)
                created_count += 1
                print(f"✅ Створено користувача: {username} / {password}")
            else:
                print(f"ℹ️  Користувач {username} вже існує")
        
        db.commit()
        print(f"\n✅ Створено {created_count} нових користувачів")
        print("\n📝 Тестові акаунти:")
        print("   Admin: admin / admin123")
        print("   Users: user1-user5 / user123")
        
    except Exception as e:
        print(f"❌ Помилка: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Створення тестових користувачів...\n")
    create_test_users()
