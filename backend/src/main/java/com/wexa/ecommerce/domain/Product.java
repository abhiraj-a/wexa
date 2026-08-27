package com.wexa.ecommerce.domain;

public record Product(String id, String name, String description, double price, String imageUrl, String category, int stock) {}
