"""fix enum values to lowercase

Revision ID: fix_enum_lowercase
Revises: 6d3c2bd01fda
Create Date: 2026-01-07

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_enum_lowercase'
down_revision = '06756e52db35'
branch_labels = None
depends_on = None


def upgrade():
    # Rename old enums
    op.execute("ALTER TYPE tournamentstatus RENAME TO tournamentstatus_old")
    op.execute("ALTER TYPE tournamentdiscipline RENAME TO tournamentdiscipline_old")
    
    # Create new enums with correct lowercase values
    op.execute("CREATE TYPE tournamentstatus AS ENUM ('registration', 'in_progress', 'finished')")
    op.execute("CREATE TYPE tournamentdiscipline AS ENUM ('free_pyramid', 'free_pyramid_extended', 'combined_pyramid', 'dynamic_pyramid', 'combined_pyramid_changes')")
    
    # Update columns to use new types with value mapping
    op.execute("""
        ALTER TABLE tournaments 
        ALTER COLUMN status TYPE tournamentstatus 
        USING LOWER(status::text)::tournamentstatus
    """)
    
    op.execute("""
        ALTER TABLE tournaments 
        ALTER COLUMN discipline TYPE tournamentdiscipline 
        USING LOWER(discipline::text)::tournamentdiscipline
    """)
    
    # Drop old enum types
    op.execute("DROP TYPE tournamentstatus_old")
    op.execute("DROP TYPE tournamentdiscipline_old")


def downgrade():
    # Rename current enums
    op.execute("ALTER TYPE tournamentstatus RENAME TO tournamentstatus_new")
    op.execute("ALTER TYPE tournamentdiscipline RENAME TO tournamentdiscipline_new")
    
    # Recreate old enums with uppercase values
    op.execute("CREATE TYPE tournamentstatus AS ENUM ('REGISTRATION', 'IN_PROGRESS', 'FINISHED')")
    op.execute("CREATE TYPE tournamentdiscipline AS ENUM ('FREE_PYRAMID', 'FREE_PYRAMID_EXTENDED', 'COMBINED_PYRAMID', 'DYNAMIC_PYRAMID', 'COMBINED_PYRAMID_CHANGES')")
    
    # Update columns back
    op.execute("""
        ALTER TABLE tournaments 
        ALTER COLUMN status TYPE tournamentstatus 
        USING UPPER(status::text)::tournamentstatus
    """)
    
    op.execute("""
        ALTER TABLE tournaments 
        ALTER COLUMN discipline TYPE tournamentdiscipline 
        USING UPPER(discipline::text)::tournamentdiscipline
    """)
    
    # Drop new types
    op.execute("DROP TYPE tournamentstatus_new")
    op.execute("DROP TYPE tournamentdiscipline_new")
