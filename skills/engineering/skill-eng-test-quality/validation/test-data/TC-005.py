"""TC-005: Tautological Over-Mocking of System Under Test (TST05)."""

from unittest.mock import MagicMock

def test_user_authentication():
    auth_service = MagicMock()
    # TST05 Defect: Mocks the entire service under test and asserts mock call, testing zero actual business logic
    auth_service.authenticate.return_value = True
    result = auth_service.authenticate("admin", "secret")
    assert result is True
    auth_service.authenticate.assert_called_once_with("admin", "secret")

