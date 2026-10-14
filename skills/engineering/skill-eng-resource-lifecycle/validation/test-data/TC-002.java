// TC-002: Exception Bypassing Manual Stream Cleanup (RES02)
package com.lifecycle.demo;

import java.io.FileInputStream;
import java.io.IOException;

public class StreamProcessor {
    public void processPayload(String path) throws IOException {
        FileInputStream fis = new FileInputStream(path);
        
        // RES02 Defect: If parseHeader throws RuntimeException, fis.close() is bypassed
        parseHeader(fis);
        
        fis.close();
    }

    private void parseHeader(FileInputStream fis) {
        throw new IllegalStateException("Corrupted header byte sequence");
    }
}

