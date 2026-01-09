#!/usr/bin/env python3
"""
Clean Heroku database - remove all data except admin user
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.player import Player
from app.models.match import Match
from app.models.tournament import Tournament
from app.models.tournament_registration import TournamentRegistration


def clean_database():
    """Clean database except admin user"""
    db = SessionLocal()
    
    try:
        print("🗑️  Starting database cleanup...")
        
        # 1. Delete tournament registrations
        registrations_count = db.query(TournamentRegistration).count()
        db.query(TournamentRegistration).delete()
        print(f"✅ Deleted {registrations_count} tournament registrations")

        # 2. Delete tournament rules (must be before tournaments)
        from app.models.tournament_rule import TournamentRule
        rules_count = db.query(TournamentRule).count()
        db.query(TournamentRule).delete()
        print(f"✅ Deleted {rules_count} tournament rules")

        # 3. Delete tournaments
        tournaments_count = db.query(Tournament).count()
        db.query(Tournament).delete()
        print(f"✅ Deleted {tournaments_count} tournaments")

        # 4. Delete matches
        matches_count = db.query(Match).count()
        db.query(Match).delete()
        print(f"✅ Deleted {matches_count} matches")
        
        # 5. Delete non-admin users (including those with player_id)
        users = db.query(User).filter(User.role != UserRole.ADMIN).all()
        users_count = len(users)
        for user in users:
            db.delete(user)
        print(f"✅ Deleted {users_count} non-admin users")

        # 6. Delete all players (now safe)
        players_count = db.query(Player).count()
        db.query(Player).delete()
        print(f"✅ Deleted {players_count} players")
        
        db.commit()
        
        print(f"\n{'='*60}")
        print("✅ Database cleaned successfully!")
        print(f"{'='*60}")
        print(f"Remaining admin users: {db.query(User).filter(User.role == UserRole.ADMIN).count()}")
        print(f"Total players: {db.query(Player).count()}")
        print(f"Total matches: {db.query(Match).count()}")
        print(f"Total tournaments: {db.query(Tournament).count()}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    confirm = input("⚠️  This will DELETE all data except admin users. Continue? (yes/no): ")
    if confirm.lower() == 'yes':
        clean_database()
    else:
        print("❌ Cancelled")
