"""add_discipline_to_matches

Revision ID: f921a713d94e
Revises: fix_enum_lowercase
Create Date: 2026-01-08 12:59:51.772366

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f921a713d94e'
down_revision: Union[str, None] = 'fix_enum_lowercase'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
