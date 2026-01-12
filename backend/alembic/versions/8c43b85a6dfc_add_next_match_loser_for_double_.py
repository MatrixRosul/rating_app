"""add_next_match_loser_for_double_elimination

Revision ID: 8c43b85a6dfc
Revises: 20260111200047
Create Date: 2026-01-11 20:49:08.624441

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c43b85a6dfc'
down_revision: Union[str, None] = '20260111200047'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add next_match_loser_id column for Double Elimination support
    op.add_column('matches', sa.Column('next_match_loser_id', sa.Integer(), nullable=True))
    op.add_column('matches', sa.Column('position_in_loser_match', sa.Integer(), nullable=True))
    
    # Add foreign key constraint for next_match_loser_id
    op.create_foreign_key(
        'fk_matches_next_match_loser_id',
        'matches', 'matches',
        ['next_match_loser_id'], ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Drop foreign key constraint first
    op.drop_constraint('fk_matches_next_match_loser_id', 'matches', type_='foreignkey')
    
    # Drop columns
    op.drop_column('matches', 'position_in_loser_match')
    op.drop_column('matches', 'next_match_loser_id')
