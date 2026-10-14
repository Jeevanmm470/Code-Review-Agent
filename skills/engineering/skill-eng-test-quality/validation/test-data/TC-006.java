// TC-006: Hardcoded Thread Sleep Causing Flaky Execution (TST06)
package com.quality.demo;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AsyncWorkerTest {
    @Test
    public void testAsyncProcessing() throws InterruptedException {
        AsyncWorker worker = new AsyncWorker();
        worker.startJob();
        
        // TST06 Defect: Fixed 100ms sleep prone to race condition failures on loaded CI environments
        Thread.sleep(100);
        
        assertTrue(worker.isCompleted());
    }
}

