"""TC-006: Broken Pagination Mapping on Token-Based Provider API (ADP06)."""

import requests

class AzureDevOpsAdapter:
    def list_repositories(self, org: str, project: str):
        # ADP06 Defect: Assuming offset-based page parameter on Azure DevOps API which uses continuation tokens
        page = 1
        all_repos = []
        while page <= 5:
            # Azure DevOps does not support ?page=N and silently ignores it, returning duplicate first pages
            resp = requests.get(f"https://dev.azure.com/{org}/{project}/_apis/git/repositories?page={page}")
            data = resp.json().get("value", [])
            if not data:
                break
            all_repos.extend(data)
            page += 1
        return all_repos

