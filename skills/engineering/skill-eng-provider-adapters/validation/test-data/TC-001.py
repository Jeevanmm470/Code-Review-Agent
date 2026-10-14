"""TC-001: Domain Boundary Violation - Leaking provider SDK types into domain interface (ADP01)."""

from github import Github, PullRequest  # Violates ADP01: Exposing SDK types in domain interface

class CodeReviewService:
    def __init__(self, token: str):
        self.client = Github(token)

    # Defect: Domain service exposes PyGithub SDK PullRequest type directly
    def get_pull_request(self, repo_name: str, pr_number: int) -> PullRequest:
        repo = self.client.get_repo(repo_name)
        return repo.get_pull(pr_number)

