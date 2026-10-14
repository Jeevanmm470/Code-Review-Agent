package com.example.testfixtures.businesslogic;

public class ApiResponse {
    private boolean success;
    private String error;

    public ApiResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }
    public boolean isSuccess() { return success; }
    public String getError() { return error; }
}

public class ProblemDetail {
    private String title;
    private String detail;

    public ProblemDetail(String title, String detail) {
        this.title = title;
        this.detail = detail;
    }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
}

public class Http200ErrorPayloadMismatch {
    // Violation: Returning HTTP 200 OK with success=false payload for validation failure
    public ApiResponse checkout(double amount) {
        if (amount <= 0) {
            return new ApiResponse(false, "Amount must be positive");
        }
        return new ApiResponse(true, null);
    }
}

public class SafeProblemDetailContract {
    // Safe Counterpart: Standard ProblemDetail contract for validation error
    public ProblemDetail checkout(double amount) {
        if (amount <= 0) {
            return new ProblemDetail("Invalid Amount", "Amount must be positive");
        }
        return new ProblemDetail("Success", null);
    }
}

