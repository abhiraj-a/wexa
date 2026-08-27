package com.wexa.ecommerce.service;

import org.neo4j.driver.Driver;
import org.neo4j.driver.Session;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class OrderService {
    private final Driver driver;

    public OrderService(Driver driver) {
        this.driver = driver;
    }

    public void checkout(List<Map<String, Object>> cartItems) {
        if (driver == null || cartItems.isEmpty()) return;

        String orderId = java.util.UUID.randomUUID().toString();
        String date = java.time.LocalDate.now().toString();

        try (Session session = driver.session()) {
            // Create Guest User if not exists
            session.run("MERGE (u:User {id: 'guest'}) ON CREATE SET u.name = 'Guest User'");

            // Create Order
            session.run("MATCH (u:User {id: 'guest'}) CREATE (o:Order {id: $orderId, date: $date}), (u)-[:PLACED]->(o)", 
                Map.of("orderId", orderId, "date", date));

            // Add items and decrement stock
            for (var item : cartItems) {
                String productId = (String) item.get("productId");
                int quantity = (Integer) item.get("quantity");
                double price = ((Number) item.get("price")).doubleValue();

                session.run("""
                    MATCH (o:Order {id: $orderId})
                    MATCH (p:Product {id: $productId})
                    CREATE (o)-[:CONTAINS {quantity: $quantity, price: $price}]->(p)
                    SET p.stock = coalesce(p.stock, 0) - $quantity
                """, Map.of(
                    "orderId", orderId,
                    "productId", productId,
                    "quantity", quantity,
                    "price", price
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Checkout failed", e);
        }
    }

    public List<Map<String, Object>> getAllOrders() {
        if (driver == null) return List.of();
        try (Session session = driver.session()) {
            return session.run("""
                MATCH (o:Order)
                OPTIONAL MATCH (o)-[r:CONTAINS]->(p:Product)
                WITH o, p, r
                ORDER BY o.date DESC
                RETURN o.id AS id, o.date AS date, collect({name: p.name, quantity: r.quantity, price: r.price}) AS items
            """).list(record -> Map.of(
                "id", record.get("id").asString(),
                "date", record.get("date").asString(),
                "items", record.get("items").asList()
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
