#!/usr/bin/env python3
"""
Import matches from CSV with numeric player IDs
"""
import sys
import csv
from datetime import datetime
from sqlalchemy import text

# Add parent directory to path
sys.path.insert(0, '/app/backend')

from app.database import SessionLocal

def import_matches():
    """Import matches from CSV file"""
    db = SessionLocal()
    
    try:
        # Read CSV file
        with open('/app/data/match_results.csv', 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            matches_data = list(reader)
        
        print(f"📊 Знайдено {len(matches_data)} матчів у CSV")
        
        # Get player name to ID mapping
        players = db.execute(text("SELECT id, name FROM players")).fetchall()
        player_map = {name: id for id, name in players}
        print(f"📋 Завантажено {len(player_map)} гравців")
        
        # Import matches
        count = 0
        skipped = 0
        
        for row in matches_data:
            player1_name = row.get('Гравець 1', '').strip()
            player2_name = row.get('Гравець 2', '').strip()
            winner_name = row.get('Переможець', '').strip()
            date_str = row.get('Дата', '').strip()
            tournament = row.get('Турнір', '').strip() or None
            stage = row.get('Стадія', '').strip() or None
            
            # Get player IDs
            player1_id = player_map.get(player1_name)
            player2_id = player_map.get(player2_name)
            
            if not player1_id or not player2_id:
                skipped += 1
                continue
            
            # Determine winner
            winner_id = None
            if winner_name == player1_name:
                winner_id = player1_id
            elif winner_name == player2_name:
                winner_id = player2_id
            
            # Parse date
            try:
                match_date = datetime.strptime(date_str, '%Y-%m-%d')
            except:
                try:
                    match_date = datetime.strptime(date_str, '%d.%m.%Y')
                except:
                    skipped += 1
                    continue
            
            # Normalize stage
            stage_map = {
                'фінал': 'final',
                'final': 'final',
                '1/2': 'semifinal',
                'semifinal': 'semifinal',
                '1/4': 'quarterfinal',
                'quarterfinal': 'quarterfinal',
                '1/8': 'round16',
                'round16': 'round16',
                'group': 'group',
                'група': 'group'
            }
            if stage:
                stage = stage_map.get(stage.lower(), stage.lower())
            
            # Insert match
            db.execute(text("""
                INSERT INTO matches 
                (player1_id, player2_id, player1_name, player2_name, winner_id, date, tournament, stage, created_at)
                VALUES (:p1_id, :p2_id, :p1_name, :p2_name, :winner_id, :date, :tournament, :stage, NOW())
            """), {
                'p1_id': player1_id,
                'p2_id': player2_id,
                'p1_name': player1_name,
                'p2_name': player2_name,
                'winner_id': winner_id,
                'date': match_date,
                'tournament': tournament,
                'stage': stage
            })
            count += 1
        
        db.commit()
        print(f"✅ Імпортовано {count} матчів")
        if skipped > 0:
            print(f"⚠️  Пропущено {skipped} матчів")
        
    except Exception as e:
        print(f"❌ Помилка: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    import_matches()
