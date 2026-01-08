"""
Script to populate discipline field in matches table from tournament data
"""
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.match import Match
from app.models.tournament import Tournament
from sqlalchemy import update


def populate_match_disciplines():
    """Populate discipline field in matches from tournament data"""
    db = SessionLocal()
    
    try:
        # Get all matches with tournament_id but no discipline
        matches_to_update = db.query(Match).filter(
            Match.tournament_id.isnot(None),
            Match.discipline.is_(None)
        ).all()
        
        print(f"Found {len(matches_to_update)} matches to update")
        
        updated_count = 0
        for match in matches_to_update:
            # Get tournament
            tournament = db.query(Tournament).filter(
                Tournament.id == match.tournament_id
            ).first()
            
            if tournament and tournament.discipline:
                match.discipline = tournament.discipline
                updated_count += 1
                
                if updated_count % 100 == 0:
                    print(f"Updated {updated_count} matches...")
        
        db.commit()
        print(f"\n✅ Successfully updated {updated_count} matches with discipline data")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Populating discipline field in matches...")
    populate_match_disciplines()
