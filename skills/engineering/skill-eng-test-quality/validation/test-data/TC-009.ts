// TC-009: Unawaited Async Promise Inside Test (TST09)
export class AsyncService {
  async computeResult(): Promise<number> {
    return 42;
  }
}

describe("AsyncServiceTests", () => {
  it("computes result asynchronously", () => {
    const service = new AsyncService();
    // TST09 Defect: Missing await causes test to exit before promise resolves, risking false-positive pass
    service.computeResult().then((val) => {
      expect(val).toBe(42);
    });
  });
});

