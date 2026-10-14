package com.example.testfixtures.security;

import java.util.List;

public interface EntityManager {
    Query createNativeQuery(String sql);
}

public interface Query {
    Query setParameter(String name, Object value);
    List getResultList();
}

public class UnsafeNativeSqlInjection {
    private EntityManager entityManager;

    // Violation: String concatenation in createNativeQuery creates SQL Injection
    public List searchUsersUnsafe(String userInput) {
        String queryStr = "SELECT * FROM users WHERE username = '" + userInput + "'";
        return entityManager.createNativeQuery(queryStr).getResultList();
    }
}

public class SafeParameterizedQueryPattern {
    private EntityManager entityManager;

    // Safe Counterpart: Named parameter binding prevents SQL Injection
    public List searchUsersSafe(String userInput) {
        String queryStr = "SELECT * FROM users WHERE username = :username";
        return entityManager.createNativeQuery(queryStr)
                .setParameter("username", userInput)
                .getResultList();
    }
}

