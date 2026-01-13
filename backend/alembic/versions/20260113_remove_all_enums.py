"""remove all enum types and convert to varchar

Revision ID: 20260113_remove_enums
Revises: 
Create Date: 2026-01-13 19:40:00

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260113_remove_enums'
down_revision = 'd3d5a05541d8'  # Latest revision
branch_labels = None
depends_on = None


def upgrade():
    """Convert all enum columns to VARCHAR"""
    
    # 1. ALTER matches.status from matchstatus enum to VARCHAR
    op.execute("ALTER TABLE matches ALTER COLUMN status TYPE VARCHAR USING status::text")
    
    # 2. ALTER tournaments.status from tournamentstatus enum to VARCHAR
    op.execute("ALTER TABLE tournaments ALTER COLUMN status TYPE VARCHAR USING status::text")
    
    # 3. ALTER tournaments.discipline from tournamentdiscipline enum to VARCHAR
    op.execute("ALTER TABLE tournaments ALTER COLUMN discipline TYPE VARCHAR USING discipline::text")
    
    # 4. ALTER tournaments.bracket_type from brackettype enum to VARCHAR
    op.execute("ALTER TABLE tournaments ALTER COLUMN bracket_type TYPE VARCHAR USING bracket_type::text")
    
    # 5. ALTER tournament_rules.bracket_type from brackettype enum to VARCHAR
    op.execute("ALTER TABLE tournament_rules ALTER COLUMN bracket_type TYPE VARCHAR USING bracket_type::text")
    
    # 6. ALTER users.role from userrole enum to VARCHAR
    op.execute("ALTER TABLE users ALTER COLUMN role TYPE VARCHAR USING role::text")
    
    # 7. ALTER tournament_registrations.status from participantstatus enum to VARCHAR
    op.execute("ALTER TABLE tournament_registrations ALTER COLUMN status TYPE VARCHAR USING status::text")
    
    # 8. Drop all enum types (they are now unused)
    op.execute("DROP TYPE IF EXISTS matchstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS tournamentstatus CASCADE")
    op.execute("DROP TYPE IF EXISTS tournamentdiscipline CASCADE")
    op.execute("DROP TYPE IF EXISTS brackettype CASCADE")
    op.execute("DROP TYPE IF EXISTS userrole CASCADE")
    op.execute("DROP TYPE IF EXISTS participantstatus CASCADE")
    
    print("✅ All enum types removed and replaced with VARCHAR")


def downgrade():
    """This migration is not reversible - enums are deprecated"""
    pass
