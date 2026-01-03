#!/usr/bin/env python3
"""
Import matches to production database using raw SQL
"""
import sys
import os
import json
import uuid
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from sqlalchemy import text

def import_matches(json_file='matches_export.json'):
    """Import matches from JSON file using raw SQL"""
    db = SessionLocal()
    
    try:
        # Check if file exists
        if not os.path.exists(json_file):
            print(f"❌ File {json_file} not found")
            return False
        
        # Load data
        with open(json_file, 'r', encoding='utf-8') as f:
            matches_data = json.load(f)
        
        print(f"📥 Found {len(matches_data)} matches to import")
        
        # Check existing matches
        result = db.execute(text("SELECT COUNT(*) FROM matches"))
        existing_count = result.scalar()
        print(f"📊 Current matches in database: {existing_count}")
        
        if existing_count > 0:
            response = input("⚠️  Database already has matches. Clear and reimport? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Import cancelled")
                return False
            
            # Clear existing matches
            db.execute(text("DELETE FROM matches"))
            db.commit()
            print("🗑️  Cleared existing matches")
        
        # Get player ID mapping (name -> UUID)
        result = db.execute(text("SELECT id, name FROM players"))
        players_map = {row[1]: row[0] for row in result}  # name -> id
        
        print(f"📋 Found {len(players_map)} players in database")
        
        # Import matches using raw SQL
        imported = 0
        skipped = 0
        
        for match_data in matches_data:
            match_id = str(uuid.uuid4())  # Generate new UUID
            
            # Map player names to new UUIDs
            player1_name = match_data.get('player1_name')
            player2_name = match_data.get('player2_name')
            
            # Skip if player names not found
            if not player1_name or not player2_name:
                skipped += 1
                continue
            
            if player1_name not in players_map or player2_name not in players_map:
                if skipped == 0:  # Only print first few
                    print(f"⚠️  Skipping match: players not found ({player1_name}, {player2_name})")
                skipped += 1
                continue
            
            # Get new player IDs
            player1_id_new = players_map[player1_name]
            player2_id_new = players_map[player2_name]
            
            # Determine winner ID
            winner_id_old = match_data['winner_id']
            if winner_id_old == match_data['player1_id']:
                winner_id_new = player1_id_new
            else:
                winner_id_new = player2_id_new
            
            db.execute(
                text("""
                INSERT INTO matches 
                (id, player1_id, player2_id, winner_id, 
                 player1_name, player2_name,
                 player1_score, player2_score, max_score,
                 player1_rating_before, player2_rating_before,
                 player1_rating_after, player2_rating_after,
                 player1_rating_change, player2_rating_change,
                 date, created_at)
                VALUES 
                (:id, :player1_id, :player2_id, :winner_id,
                 :player1_name, :player2_name,
                 :player1_score, :player2_score, :max_score,
                 :player1_rating_before, :player2_rating_before,
                 :player1_rating_after, :player2_rating_after,
                 :player1_rating_change, :player2_rating_change,
                 :date, NOW())
                """),
                {
                    'id': match_id,
                    'player1_id': player1_id_new,
                    'player2_id': player2_id_new,
                    'winner_id': winner_id_new,
                    'player1_name': player1_name,
                    'player2_name': player2_name,
                    'player1_score': match_data['player1_score'],
                    'player2_score': match_data['player2_score'],
                    'max_score': match_data['max_score'],
                    'player1_rating_before': match_data['player1_rating_before'],
                    'player2_rating_before': match_data['player2_rating_before'],
                    'player1_rating_after': match_data['player1_rating_after'],
                    'player2_rating_after': match_data['player2_rating_after'],
                    'player1_rating_change': match_data['player1_rating_change'],
                    'player2_rating_change': match_data['player2_rating_change'],
                    'date': match_data['date'],
                }
            )
            imported += 1
            
            if imported % 50 == 0:
                print(f"   Imported {imported}/{len(matches_data)}...")
        
        db.commit()
        
        # Verify import
        result = db.execute(text("SELECT COUNT(*) FROM matches"))
        final_count = result.scalar()
        
        print(f"\n✅ Successfully imported {imported} matches!")
        if skipped > 0:
            print(f"⚠️  Skipped {skipped} matches (player not found)")
        print(f"📊 Total matches in database: {final_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error importing matches: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Importing matches to production database...\n")
    success = import_matches()
    sys.exit(0 if success else 1)
