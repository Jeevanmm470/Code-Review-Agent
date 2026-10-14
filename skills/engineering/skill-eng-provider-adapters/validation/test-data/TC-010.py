"""TC-010: Asymmetric Test Coverage - Verifying only one provider implementation (ADP10)."""

import unittest
from adapters.github import GitHubAdapter
from adapters.gitlab import GitLabAdapter

class AdapterContractTest(unittest.TestCase):
    # ADP10 Defect: Test suite verifies contract against GitHubAdapter only; GitLabAdapter is completely untested
    def test_get_pr_contract(self):
        adapter = GitHubAdapter(token="mock")
        res = adapter.get_pr("repo", 1)
        self.assertIsNotNone(res.title)

