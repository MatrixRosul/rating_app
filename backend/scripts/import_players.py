#!/usr/bin/env python3
"""
Import players to production database
Run this on Heroku after deployment
"""
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.player import Player

def import_players(json_file='players_export.json'):
    """Import players from JSON file"""
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
        existing_count = db.query(Player).count()
        print(f"📊 Current players in database: {existing_count}")
        
        if existing_count > 0:
            response = input("⚠️  Database already has players. Clear and reimport? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Import cancelled")
                return False
            
            # Clear existing players
            db.query(Player).delete()
            db.commit()
            print("🗑️  Cleared existing players")
        
        # Import players
        imported = 0
        for player_data in players_data:
            player = Player(
                name=player_data['name'],
                first_name=player_data.get('first_name'),
                last_name=player_data.get('last_name'),
                city=player_data.get('city'),
                year_of_birth=player_data.get('year_of_birth'),
                rating=player_data['rating'],
                initial_rating=player_data.get('initial_rating', player_data['rating']),
                peak_rating=player_data.get('peak_rating', player_data['rating']),
                is_cms=player_data.get('is_cms', False),
            )
            db.add(player)
            imported += 1
        
        db.commit()
        
        print(f"\n✅ Successfully imported {imported} players!")
        print(f"📊 Total players in database: {db.query(Player).count()}")
        
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
