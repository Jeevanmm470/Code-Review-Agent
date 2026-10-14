"""TC-004: Destructive Single-Step Database Column Drop (BWC04)."""

from alembic import op
import sqlalchemy as sa

def upgrade():
    # BWC04 Defect: Dropping active column 'phone_number' in a single step breaks running app instances during rolling deploy
    op.drop_column("users", "phone_number")

def downgrade():
    op.add_column("users", sa.Column("phone_number", sa.String(50), nullable=True))

