#!/usr/bin/env python3
"""
Export matches from local database to JSON
"""
import sys
import os
import json
from datetime import datetime

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.match import Match

def export_matches(output_file='matches_export.json'):
    """Export all matches to JSON file"""
    db = SessionLocal()
    
    try:
        # Get all matches
        matches = db.query(Match).all()
        
        print(f"📥 Found {len(matches)} matches to export")
        
        # Convert to JSON-serializable format
        matches_data = []
        for match in matches:
            match_dict = {
                'player1_id': match.player1_id,
                'player2_id': match.player2_id,
                'winner_id': match.winner_id,
                'player1_score': match.player1_score,
                'player2_score': match.player2_score,
                'max_score': match.max_score,
                'player1_rating_before': match.player1_rating_before,
                'player2_rating_before': match.player2_rating_before,
                'player1_rating_after': match.player1_rating_after,
                'player2_rating_after': match.player2_rating_after,
                'player1_rating_change': match.player1_rating_change,
                'player2_rating_change': match.player2_rating_change,
                'date': match.date.isoformat() if match.date else None,
            }
            matches_data.append(match_dict)
        
        # Save to JSON
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(matches_data, f, ensure_ascii=False, indent=2)
        
        print(f"\n✅ Exported {len(matches_data)} matches to {output_file}")
        
        # Print some stats
        if matches_data:
            dates = [m['date'] for m in matches_data if m['date']]
            if dates:
                print(f"📊 Date range: {min(dates)} to {max(dates)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error exporting matches: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Exporting matches from local database...\n")
    export_matches()
