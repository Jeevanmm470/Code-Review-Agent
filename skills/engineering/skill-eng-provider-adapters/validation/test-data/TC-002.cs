// TC-002: Inconsistent Canonical Status Mapping (ADP02)
namespace CodeReview.Adapters.GitLab;

public enum PullRequestStatus
{
    Open,
    Merged,
    Closed
}

public class GitLabAdapter
{
    // Defect: Mapping GitLab "opened" to Closed instead of Open, producing inconsistent domain status
    public PullRequestStatus MapStatus(string gitlabState)
    {
        return gitlabState switch
        {
            "merged" => PullRequestStatus.Merged,
            "opened" => PullRequestStatus.Closed, // ADP02 Defect: Inverted status mapping
            _ => PullRequestStatus.Closed
        };
    }
}

