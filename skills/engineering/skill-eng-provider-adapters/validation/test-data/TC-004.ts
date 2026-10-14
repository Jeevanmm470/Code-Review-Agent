// TC-004: Unvalidated Provider Selection Defaulting to Arbitrary Provider (ADP04)
import { GitHubAdapter } from "./github";
import { GitLabAdapter } from "./gitlab";
import { ProviderAdapter } from "./interface";

export class AdapterFactory {
  // ADP04 Defect: Unvalidated provider identifier defaulting silently to GitHubAdapter
  static getAdapter(providerName: string, token: string): ProviderAdapter {
    if (providerName.toLowerCase() === "gitlab") {
      return new GitLabAdapter(token);
    }
    // Silently falls back to GitHubAdapter even if providerName is 'unknown' or invalid
    return new GitHubAdapter(token);
  }
}

