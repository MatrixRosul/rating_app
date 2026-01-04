#!/usr/bin/env python3
"""
Import players from CSV with numeric IDs (not UUID)
"""
import sys
import csv
from datetime import datetime
from sqlalchemy import text

# Add parent directory to path
sys.path.insert(0, '/app/backend')

from app.database import SessionLocal, engine

def import_players():
    """Import players from CSV file"""
    db = SessionLocal()
    
    try:
        # Read CSV file
        with open('/app/data/players.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            players_data = list(reader)
        
        print(f"📊 Знайдено {len(players_data)} гравців у CSV")
        
        # Prepare batch insert
        count = 0
        for row in players_data:
            # Parse data
            first_name = row.get('first_name', '').strip()
            last_name = row.get('last_name', '').strip()
            name = f"{first_name} {last_name}".strip()
            city = row.get('city', '').strip() or None
            yob = row.get('yob', '').strip()
            year_of_birth = int(yob) if yob and yob.isdigit() else None
            
            if not name:
                continue
            
            # Insert player with default values
            db.execute(text("""
                INSERT INTO players (name, rating, initial_rating, peak_rating, is_cms, city, year_of_birth, created_at, updated_at)
                VALUES (:name, 1600.0, 1600.0, 1600.0, false, :city, :yob, NOW(), NOW())
            """), {
                'name': name,
                'city': city,
                'yob': year_of_birth
            })
            count += 1
        
        db.commit()
        print(f"✅ Імпортовано {count} гравців з числовими ID")
        
    except Exception as e:
        print(f"❌ Помилка: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_players()
