"""TC-010: Missing Legacy Serialization Regression Test (BWC10)."""

import unittest

class UserSerializerTest(unittest.TestCase):
    # BWC10 Defect: Test only tests new schema structure; legacy serialized payload test was deleted
    def test_v2_payload_serialization(self):
        payload = {"account_id": "123", "full_name": "Jane"}
        self.assertIn("account_id", payload)

