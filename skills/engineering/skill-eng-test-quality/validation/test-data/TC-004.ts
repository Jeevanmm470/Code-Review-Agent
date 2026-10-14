// TC-004: Global State Leakage Across Tests (TST04)
export class GlobalConfig {
  static baseUrl: string = "https://api.prod.com";
}

describe("ConfigTests", () => {
  it("modifies global config without teardown", () => {
    // TST04 Defect: Mutates static state without afterEach cleanup, leaking into subsequent test files
    GlobalConfig.baseUrl = "http://localhost:8080";
    expect(GlobalConfig.baseUrl).toBe("http://localhost:8080");
  });
});

