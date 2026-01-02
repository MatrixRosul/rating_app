"""
Міграція tournament_registrations:
- Видаляємо стару таблицю (user_id)
- Створюємо нову таблицю (player_id)
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import text
from app.database import engine

def migrate_tournament_registrations():
    """Recreate tournament_registrations table with player_id instead of user_id"""
    
    print("🔧 Міграція tournament_registrations...")
    
    with engine.connect() as conn:
        # Drop existing table
        print("📝 Видалення старої таблиці...")
        conn.execute(text("DROP TABLE IF EXISTS tournament_registrations CASCADE"))
        conn.commit()
        
        print("✅ Стара таблиця видалена")
        
        # Create new table
        print("📝 Створення нової таблиці...")
        create_table_sql = """
        CREATE TABLE tournament_registrations (
            id SERIAL PRIMARY KEY,
            tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
            player_id VARCHAR NOT NULL REFERENCES players(id) ON DELETE CASCADE,
            registered_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(tournament_id, player_id)
        )
        """
        conn.execute(text(create_table_sql))
        conn.commit()
        
        print("✅ Нова таблиця створена")
        print("✅ Міграція завершена успішно!")
        print("\n📊 Нова структура:")
        print("   - tournament_id → tournaments.id")
        print("   - player_id → players.id (не user_id!)")
        print("   - registered_by_user_id → users.id (хто зареєстрував)")

if __name__ == "__main__":
    try:
        migrate_tournament_registrations()
    except Exception as e:
        print(f"\n❌ Помилка міграції: {e}")
        import traceback
        traceback.print_exc()
