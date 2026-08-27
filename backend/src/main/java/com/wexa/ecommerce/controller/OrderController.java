package com.wexa.ecommerce.controller;

import com.wexa.ecommerce.service.OrderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public void checkout(@RequestBody List<Map<String, Object>> cartItems) {
        orderService.checkout(cartItems);
    }

    @GetMapping
    public List<Map<String, Object>> getAllOrders() {
        return orderService.getAllOrders();
    }
}
