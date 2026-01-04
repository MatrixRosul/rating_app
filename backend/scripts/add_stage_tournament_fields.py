"""
Add stage and tournament fields to matches table
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sqlalchemy import text
from app.database import engine

def add_fields():
    """Add stage and tournament columns to matches table"""
    with engine.connect() as conn:
        # Check if columns already exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='matches' AND column_name IN ('stage', 'tournament')
        """))
        existing_columns = [row[0] for row in result]
        
        # Add tournament column if it doesn't exist
        if 'tournament' not in existing_columns:
            print("Adding 'tournament' column...")
            conn.execute(text("ALTER TABLE matches ADD COLUMN tournament VARCHAR"))
            conn.commit()
            print("✅ Added 'tournament' column")
        else:
            print("ℹ️ Column 'tournament' already exists")
        
        # Add stage column if it doesn't exist
        if 'stage' not in existing_columns:
            print("Adding 'stage' column...")
            conn.execute(text("ALTER TABLE matches ADD COLUMN stage VARCHAR"))
            conn.commit()
            print("✅ Added 'stage' column")
        else:
            print("ℹ️ Column 'stage' already exists")
    
    print("\n✅ Migration completed!")

if __name__ == "__main__":
    print("🔄 Adding stage and tournament fields to matches table...")
    add_fields()
