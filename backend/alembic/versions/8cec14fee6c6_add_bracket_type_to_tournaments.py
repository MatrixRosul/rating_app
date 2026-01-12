"""add_bracket_type_to_tournaments

Revision ID: 8cec14fee6c6
Revises: 8c43b85a6dfc
Create Date: 2026-01-11 20:54:41.456238

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8cec14fee6c6'
down_revision: Union[str, None] = '8c43b85a6dfc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add bracket_type column with default value
    op.add_column('tournaments', sa.Column('bracket_type', sa.String(), nullable=False, server_default='single_elimination'))


def downgrade() -> None:
    # Drop bracket_type column
    op.drop_column('tournaments', 'bracket_type')
