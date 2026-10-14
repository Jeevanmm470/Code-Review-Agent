package com.example.testfixtures.maintainability;

import java.io.FileInputStream;
import java.io.IOException;

public class UnmanagedStreamLeak {
    // Violation: FileInputStream opened without try-with-resources
    public byte[] readFileUnsafe(String path) throws IOException {
        FileInputStream fis = new FileInputStream(path);
        byte[] buffer = new byte[1024];
        fis.read(buffer);
        return buffer;
    }
}

public class SafeTryWithResources {
    // Safe Counterpart: Managed resource using try-with-resources
    public byte[] readFileSafe(String path) throws IOException {
        try (FileInputStream fis = new FileInputStream(path)) {
            byte[] buffer = new byte[1024];
            fis.read(buffer);
            return buffer;
        }
    }
}

