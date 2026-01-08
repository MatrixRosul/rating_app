import sys
import os
import csv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Player

def update_players_from_csv():
    """Update players with city and year_of_birth from CSV"""
    
    db = SessionLocal()
    
    try:
        # Read players CSV file
        csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 
                               "data", "players.csv")
        
        print(f"Reading CSV from: {csv_path}")
        
        updated_count = 0
        not_found_count = 0
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                first_name = row['first_name'].strip()
                last_name = row['last_name'].strip()
                city = row['city'].strip()
                yob = int(row['yob'].strip()) if row['yob'].strip() else None
                
                full_name = f"{first_name} {last_name}"
                
                # Find player by name
                player = db.query(Player).filter(Player.name == full_name).first()
                
                if player:
                    # Update city and year_of_birth
                    player.city = city
                    player.year_of_birth = yob
                    player.first_name = first_name
                    player.last_name = last_name
                    updated_count += 1
                    print(f"✓ Updated: {full_name} - {city}, {yob}")
                else:
                    not_found_count += 1
                    print(f"✗ Not found in DB: {full_name}")
        
        db.commit()
        
        print(f"\n{'='*50}")
        print(f"✓ Successfully updated: {updated_count} players")
        print(f"✗ Not found in DB: {not_found_count} players")
        print(f"{'='*50}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_players_from_csv()
