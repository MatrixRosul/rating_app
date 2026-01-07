#!/usr/bin/env python3
"""
Create specific users on Heroku database
"""
import sys
import os
import random
import string

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.player import Player
from app.auth import get_password_hash


def generate_password(length=8):
    """Generate random password"""
    characters = string.ascii_letters + string.digits
    password = ''.join(random.choice(characters) for _ in range(length))
    return password


def create_users():
    """Create users for specific players"""
    db = SessionLocal()
    
    # Players we want to create users for
    target_players = [
        'Максим Росул',
        'Олександр Грін'
    ]
    
    credentials = []
    
    try:
        for player_name in target_players:
            # Find player
            player = db.query(Player).filter(Player.name == player_name).first()
            
            if not player:
                print(f"❌ Player not found: {player_name}")
                continue
            
            # Generate username
            username_map = {
                'Максим Росул': 'maksym_rosul',
                'Олександр Грін': 'oleksandr_hrin'
            }
            username = username_map[player_name]
            
            # Generate password
            password = generate_password(8)
            
            # Create user
            user = User(
                username=username,
                password_hash=get_password_hash(password),
                role=UserRole.USER,
                player_id=player.id
            )
            
            db.add(user)
            
            credentials.append({
                'name': player.name,
                'username': username,
                'password': password,
                'rating': int(player.rating)
            })
            
            print(f"✅ Created user for {player.name}")
            print(f"   Username: {username}")
            print(f"   Password: {password}")
            print(f"   Rating: {int(player.rating)}\n")
        
        # Commit changes
        db.commit()
        
        # Save to file
        output_file = "heroku_credentials.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("HEROKU USER CREDENTIALS\n")
            f.write("=" * 80 + "\n\n")
            
            for cred in credentials:
                f.write(f"{cred['name']} (Rating: {cred['rating']})\n")
                f.write(f"Username: {cred['username']}\n")
                f.write(f"Password: {cred['password']}\n")
                f.write("-" * 80 + "\n")
        
        print(f"💾 Credentials saved to: {output_file}")
        
        return credentials
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    create_users()
