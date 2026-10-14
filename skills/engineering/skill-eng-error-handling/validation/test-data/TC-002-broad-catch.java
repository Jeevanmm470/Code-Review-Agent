// TC-002: Overly Broad Exception Handling
package com.example.service;

import com.example.config.AppConfig;
import com.example.parser.ConfigParser;

public class ConfigurationService {
    public AppConfig loadConfiguration(String rawJson) {
        try {
            return ConfigParser.parse(rawJson);
        } catch (Throwable t) { // VIOLATION (ERR02): Broad catch Throwable masks NullPointerException and OutOfMemoryError
            return AppConfig.empty();
        }
    }
}

