// TC-004: Instantiating cloud SDK client per request causing connection pool churn
package com.example.cloud;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.web.bind.annotation.*;

@RestController
public class S3UploadController {

    @PostMapping("/files")
    public void uploadFile(@RequestBody String content) {
        // Defect CLD04: Creating new SDK client on every request destroys connection reuse
        AmazonS3 s3Client = AmazonS3ClientBuilder.standard().build();
        s3Client.putObject("my-bucket", "key", content);
    }
}

