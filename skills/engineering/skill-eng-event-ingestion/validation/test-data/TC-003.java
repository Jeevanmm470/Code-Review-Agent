// TC-003: Missing content-type and payload size validation on incoming event stream
package com.example.webhooks;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/events")
public class EventReceiverController {

    // Defect EVT03: Unbounded body parsing without content-type check or size limits
    @PostMapping(value = "/ingest")
    public String ingestRawEvent(@RequestBody byte[] rawPayload) {
        // Reads arbitrary byte size into memory without schema or content-type enforcement
        return "accepted";
    }
}

