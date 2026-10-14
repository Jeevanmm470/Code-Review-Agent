"""TC-010: Test Fixture Leaking Persistent Temporary State Across Runs (RES10)."""

import os
import unittest

class FileCacheTest(unittest.TestCase):
    # RES10 Defect: Test creates real filesystem artifacts without tearDown cleanup, leaking state
    def test_cache_creation(self):
        cache_dir = "/tmp/test_cache_run"
        os.makedirs(cache_dir, exist_ok=True)
        with open(os.path.join(cache_dir, "item.txt"), "w") as f:
            f.write("test_data")
        self.assertTrue(os.path.exists(os.path.join(cache_dir, "item.txt")))
        # Defect: Missing tearDown / cleanup hook causes subsequent test runs to inherit stale artifacts

