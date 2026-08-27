package com.wexa.ecommerce.controller;

import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final org.neo4j.driver.Driver driver;

    public AdminController(org.neo4j.driver.Driver driver) {
        this.driver = driver;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if ("admin".equals(username) && "admin123".equals(password)) {
            return Map.of("token", "fake-jwt-token-12345");
        } else {
            throw new RuntimeException("Invalid credentials");
        }
    }
}
