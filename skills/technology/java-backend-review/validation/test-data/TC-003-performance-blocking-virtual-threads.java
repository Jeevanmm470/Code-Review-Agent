package com.example.testfixtures.performance;

import java.util.concurrent.locks.ReentrantLock;

public class SynchronizedThreadPinning {
    // Violation: synchronized block pins virtual thread to carrier OS thread during I/O
    public synchronized String fetchDataUnsafe() {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return "data";
    }
}

public class SafeReentrantLockPattern {
    private final ReentrantLock lock = new ReentrantLock();

    // Safe Counterpart: ReentrantLock prevents thread pinning on virtual threads
    public String fetchDataSafe() {
        lock.lock();
        try {
            Thread.sleep(100);
            return "data";
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return "";
        } finally {
            lock.unlock();
        }
    }
}

