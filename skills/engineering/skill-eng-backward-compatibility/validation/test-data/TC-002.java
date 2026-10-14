// TC-002: Adding Mandatory Required Field to Existing Request Payload (BWC02)
package com.compat.demo;

import com.fasterxml.jackson.annotation.JsonProperty;

public class CreateOrderRequest {
    @JsonProperty(required = true)
    private String orderId;

    // BWC02 Defect: Adding required billingTaxId without default value breaks existing clients sending old JSON payloads
    @JsonProperty(required = true)
    private String billingTaxId;

    public CreateOrderRequest() {}
}

