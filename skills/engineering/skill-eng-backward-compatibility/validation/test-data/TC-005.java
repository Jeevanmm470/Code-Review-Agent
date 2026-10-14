// TC-005: Strict Deserialization Failure on Stored JSON Documents (BWC05)
package com.compat.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.DeserializationFeature;

public class DocumentStoreReader {
    private final ObjectMapper mapper = new ObjectMapper();

    public DocumentStoreReader() {
        // BWC05 Defect: FAIL_ON_UNKNOWN_PROPERTIES causes crashes when reading legacy documents with extra fields
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);
    }

    public <T> T readDocument(String json, Class<T> clazz) throws Exception {
        return mapper.readValue(json, clazz);
    }
}

