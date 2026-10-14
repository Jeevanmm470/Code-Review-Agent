// TC-008: Leaked Temporary File on Processing Failure (RES08)
package com.lifecycle.demo;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

public class ImageConverter {
    public void convertImage(byte[] rawData) throws IOException {
        // RES08 Defect: Temp file created without deleteOnExit() or try-finally deletion
        File tempFile = File.createTempFile("upload_", ".raw");
        Files.write(tempFile.toPath(), rawData);

        if (rawData.length > 1024 * 1024 * 10) {
            // Throws exception and leaves orphaned tempFile filling up disk space
            throw new IllegalArgumentException("File size exceeds 10MB limit");
        }

        // Process and delete
        tempFile.delete();
    }
}

