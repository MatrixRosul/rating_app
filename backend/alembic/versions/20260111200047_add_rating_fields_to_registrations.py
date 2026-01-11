"""add rating fields to registrations

Revision ID: 20260111200047
Revises: 6d3c2bd01fda
Create Date: 2026-01-11 20:00:47

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260111200047'
down_revision = '82ac04ee3193'  # Updated to merge from tables migration
branch_labels = None
depends_on = None


def upgrade():
    # Add rating tracking columns to tournament_registrations
    op.add_column('tournament_registrations', sa.Column('rating_before', sa.Integer(), nullable=True))
    op.add_column('tournament_registrations', sa.Column('rating_after', sa.Integer(), nullable=True))
    op.add_column('tournament_registrations', sa.Column('rating_change', sa.Integer(), nullable=True))
    op.add_column('tournament_registrations', sa.Column('final_place', sa.Integer(), nullable=True))


def downgrade():
    # Remove rating tracking columns
    op.drop_column('tournament_registrations', 'final_place')
    op.drop_column('tournament_registrations', 'rating_change')
    op.drop_column('tournament_registrations', 'rating_after')
    op.drop_column('tournament_registrations', 'rating_before')
