"""TC-011: Compliant VCS Provider Adapter Implementation (Passing Case)."""

from typing import Optional, List
from dataclasses import dataclass
from github import Github, GithubException

@dataclass(frozen=True)
class CanonicalPullRequest:
    id: str
    title: str
    is_open: bool

class DomainProviderException(Exception):
    """Normalized domain exception."""
    pass

class GitHubCompliantAdapter:
    def __init__(self, token: str):
        self._client = Github(token)

    def get_pull_request(self, repo: str, pr_id: int) -> CanonicalPullRequest:
        try:
            gh_pr = self._client.get_repo(repo).get_pull(pr_id)
            # Translates SDK object into canonical domain entity
            return CanonicalPullRequest(
                id=str(gh_pr.number),
                title=gh_pr.title,
                is_open=(gh_pr.state == "open")
            )
        except GithubException as exc:
            # Wraps SDK error in normalized domain error with cause preservation
            raise DomainProviderException(f"Failed to fetch PR {pr_id} from GitHub: {str(exc)}") from exc

