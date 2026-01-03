#!/usr/bin/env python3
"""
Export players from local database to Heroku
This script connects to local DB and exports all players
"""
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.player import Player

def export_players():
    """Export all players to JSON"""
    db = SessionLocal()
    
    try:
        players = db.query(Player).all()
        
        players_data = []
        for player in players:
            players_data.append({
                'name': player.name,
                'first_name': player.first_name,
                'last_name': player.last_name,
                'city': player.city,
                'year_of_birth': player.year_of_birth,
                'rating': player.rating,
                'initial_rating': player.initial_rating,
                'peak_rating': player.peak_rating,
                'is_cms': player.is_cms,
            })
        
        # Save to file
        output_file = 'players_export.json'
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(players_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Exported {len(players_data)} players to {output_file}")
        print(f"\n📊 Statistics:")
        print(f"   Total players: {len(players_data)}")
        print(f"   Average rating: {sum(p['rating'] for p in players_data) / len(players_data):.0f}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("📤 Exporting players from local database...\n")
    export_players()
