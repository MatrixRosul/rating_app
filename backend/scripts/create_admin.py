#!/usr/bin/env python3
"""
Create admin user for production
Run this on Heroku after deployment
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.auth import get_password_hash

def create_admin():
    """Create admin user if not exists"""
    db = SessionLocal()
    
    try:
        # Check if admin exists
        existing_admin = db.query(User).filter(User.username == "admin").first()
        
        if existing_admin:
            print("✅ Admin user already exists")
            print(f"   Username: {existing_admin.username}")
            print(f"   Role: {existing_admin.role}")
            return True
        
        # Create admin user
        admin = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN,
            player_id=None  # Admin is not a player
        )
        
        db.add(admin)
        db.commit()
        
        print("✅ Admin user created successfully!")
        print("   Username: admin")
        print("   Password: admin123")
        print("   Role: ADMIN")
        
        # Count players
        from app.models.player import Player
        player_count = db.query(Player).count()
        print(f"\n📊 Database status:")
        print(f"   Players in database: {player_count}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🔧 Creating admin user for production...\n")
    success = create_admin()
    sys.exit(0 if success else 1)
