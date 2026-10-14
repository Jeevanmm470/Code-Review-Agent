"""TC-007: Removing Legacy Environment Variable Fallback (BWC07)."""

import os

class DatabaseConfig:
    def __init__(self):
        # BWC07 Defect: Directly reading DATABASE_URL without fallback to DB_HOST/DB_USER breaks existing deployments
        self.url = os.environ["DATABASE_URL"] # Removed support for legacy DB_HOST & DB_PORT

