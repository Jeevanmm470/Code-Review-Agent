"""TC-005: Raw Provider Exception Leaking Across Boundary (ADP05)."""

from github import GithubException

class GitHubPRAdapter:
    def __init__(self, client):
        self._client = client

    def fetch_diff(self, repo: str, pr_id: int) -> str:
        try:
            return self._client.get_repo(repo).get_pull(pr_id).diff_url
        except GithubException as e:
            # ADP05 Defect: Re-raising provider-specific SDK exception across domain boundary
            raise e

