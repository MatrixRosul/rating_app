"""add_discipline_to_matches

Revision ID: 9a538e7d9564
Revises: f921a713d94e
Create Date: 2026-01-08 13:00:32.687038

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a538e7d9564'
down_revision: Union[str, None] = 'f921a713d94e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add discipline column to matches table
    op.add_column('matches', sa.Column('discipline', sa.String(), nullable=True))
    op.create_index(op.f('ix_matches_discipline'), 'matches', ['discipline'], unique=False)


def downgrade() -> None:
    # Remove discipline column from matches table
    op.drop_index(op.f('ix_matches_discipline'), table_name='matches')
    op.drop_column('matches', 'discipline')
