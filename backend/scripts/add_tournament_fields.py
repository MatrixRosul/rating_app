"""
Script to add new fields to tournaments table
"""
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine, text
from app.database import DATABASE_URL

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Add new columns
        try:
            print("Adding city column...")
            conn.execute(text("ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS city VARCHAR NOT NULL DEFAULT 'Київ'"))
            conn.commit()
            print("✅ city column added")
        except Exception as e:
            print(f"❌ Error adding city: {e}")
            conn.rollback()
        
        try:
            print("Adding country column...")
            conn.execute(text("ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS country VARCHAR NOT NULL DEFAULT 'Україна'"))
            conn.commit()
            print("✅ country column added")
        except Exception as e:
            print(f"❌ Error adding country: {e}")
            conn.rollback()
        
        try:
            print("Adding club column...")
            conn.execute(text("ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS club VARCHAR NOT NULL DEFAULT 'Невказано'"))
            conn.commit()
            print("✅ club column added")
        except Exception as e:
            print(f"❌ Error adding club: {e}")
            conn.rollback()
        
        try:
            print("Creating discipline enum type...")
            conn.execute(text("""
                DO $$ BEGIN
                    CREATE TYPE tournamentdiscipline AS ENUM (
                        'Вільна піраміда',
                        'Вільна піраміда з продовженням',
                        'Комбінована піраміда',
                        'Динамічна піраміда',
                        'Комбінована піраміда зі змінами'
                    );
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            """))
            conn.commit()
            print("✅ discipline enum type created")
        except Exception as e:
            print(f"❌ Error creating enum: {e}")
            conn.rollback()
        
        try:
            print("Adding discipline column...")
            conn.execute(text("ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS discipline tournamentdiscipline NOT NULL DEFAULT 'Вільна піраміда'"))
            conn.commit()
            print("✅ discipline column added")
        except Exception as e:
            print(f"❌ Error adding discipline: {e}")
            conn.rollback()
    
    print("\n🎉 Migration completed!")

if __name__ == "__main__":
    migrate()
