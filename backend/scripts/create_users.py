"""
Create initial users (admin and regular users)

Run this script from backend directory:
    cd /Users/maxrosul/ratingAPP/backend
    source venv/bin/activate
    python -c "exec(open('scripts/create_users.py').read())"
"""
import sys
import os
# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.player import Player
from app.auth import get_password_hash


def create_initial_users():
    """Create admin and sample users"""
    db = SessionLocal()
    
    try:
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"⚠️  Users already exist ({existing_users} users found)")
            response = input("Do you want to continue and create more users? (y/n): ")
            if response.lower() != 'y':
                print("❌ Cancelled")
                return
        
        # 1. Create admin user
        admin = User(
            username="admin",
            password_hash=get_password_hash("admin123"),  # TODO: Change in production!
            role=UserRole.ADMIN,
            player_id=None  # Admin is not a player
        )
        db.add(admin)
        print("✅ Created admin user (username: admin, password: admin123)")
        
        # 2. Create user accounts for some players
        # Get a few players from database
        players = db.query(Player).limit(5).all()
        
        if len(players) == 0:
            print("⚠️  No players found in database. Skipping user creation for players.")
        else:
            for i, player in enumerate(players, 1):
                # Create username from player name (lowercase, no spaces)
                username = player.name.lower().replace(" ", "_")
                
                # Default password is "player123"
                user = User(
                    username=username,
                    password_hash=get_password_hash("player123"),  # TODO: Players should change this!
                    role=UserRole.USER,
                    player_id=player.id
                )
                db.add(user)
                print(f"✅ Created user for player {player.name} (username: {username}, password: player123)")
        
        # Commit all changes
        db.commit()
        print("\n" + "="*60)
        print("🎉 Users created successfully!")
        print("="*60)
        print("\nLogin credentials:")
        print("  Admin:  username='admin', password='admin123'")
        print("  Users:  username='<player_name>', password='player123'")
        print("\n⚠️  IMPORTANT: Change these passwords in production!")
        print("="*60)
        
    except Exception as e:
        print(f"❌ Error creating users: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    print("Creating initial users...")
    print("-" * 60)
    create_initial_users()
