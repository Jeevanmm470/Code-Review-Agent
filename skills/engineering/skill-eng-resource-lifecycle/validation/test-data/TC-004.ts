// TC-004: Resource Disposed While Async Work Remains In-Flight (RES04)
import { DatabaseConnection } from "./db";

export class ReportGenerator {
  async generateReport(dbPool: any) {
    const conn = await dbPool.getConnection();
    try {
      // RES04 Defect: Unawaited asynchronous operation spawned against conn, but conn is released immediately in finally
      this.runAsyncLogAudit(conn, "Report generation triggered");
      return await conn.query("SELECT * FROM financial_records");
    } finally {
      // Causes use-after-disposal in runAsyncLogAudit
      conn.release();
    }
  }

  private async runAsyncLogAudit(conn: any, message: string) {
    await new Promise((r) => setTimeout(r, 200));
    await conn.query("INSERT INTO audit_logs (msg) VALUES (?)", [message]);
  }
}

