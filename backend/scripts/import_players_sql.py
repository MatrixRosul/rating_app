#!/usr/bin/env python3
"""
Import players using raw SQL to production database
"""
import sys
import os
import json
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from sqlalchemy import text

def import_players(json_file='players_export.json'):
    """Import players from JSON file using raw SQL"""
    db = SessionLocal()
    
    try:
        # Check if file exists
        if not os.path.exists(json_file):
            print(f"❌ File {json_file} not found")
            return False
        
        # Load data
        with open(json_file, 'r', encoding='utf-8') as f:
            players_data = json.load(f)
        
        print(f"📥 Found {len(players_data)} players to import")
        
        # Check existing players
        result = db.execute(text("SELECT COUNT(*) FROM players"))
        existing_count = result.scalar()
        print(f"📊 Current players in database: {existing_count}")
        
        if existing_count > 0:
            response = input("⚠️  Database already has players. Clear and reimport? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Import cancelled")
                return False
            
            # Clear existing players
            db.execute(text("DELETE FROM players"))
            db.commit()
            print("🗑️  Cleared existing players")
        
        # Import players using raw SQL
        imported = 0
        for player_data in players_data:
            player_id = str(uuid.uuid4())  # Generate new UUID
            
            db.execute(
                text("""
                INSERT INTO players 
                (id, name, first_name, last_name, city, year_of_birth, 
                 rating, initial_rating, peak_rating, is_cms, created_at, updated_at)
                VALUES 
                (:id, :name, :first_name, :last_name, :city, :year_of_birth,
                 :rating, :initial_rating, :peak_rating, :is_cms, NOW(), NOW())
                """),
                {
                    'id': player_id,
                    'name': player_data['name'],
                    'first_name': player_data.get('first_name'),
                    'last_name': player_data.get('last_name'),
                    'city': player_data.get('city'),
                    'year_of_birth': player_data.get('year_of_birth'),
                    'rating': player_data['rating'],
                    'initial_rating': player_data.get('initial_rating', player_data['rating']),
                    'peak_rating': player_data.get('peak_rating', player_data['rating']),
                    'is_cms': player_data.get('is_cms', False)
                }
            )
            imported += 1
            
            if imported % 10 == 0:
                print(f"   Imported {imported}/{len(players_data)}...")
        
        db.commit()
        
        # Verify import
        result = db.execute(text("SELECT COUNT(*) FROM players"))
        final_count = result.scalar()
        
        print(f"\n✅ Successfully imported {imported} players!")
        print(f"📊 Total players in database: {final_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error importing players: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Importing players to production database...\n")
    success = import_players()
    sys.exit(0 if success else 1)
