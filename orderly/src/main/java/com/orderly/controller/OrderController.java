package com.orderly.controller;

import com.orderly.model.Order;
import com.orderly.service.OrderService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * API endpoint to place a new order.
     * @param orderRequest The request body containing userId and cart items.
     * @return The created order.
     */
    @PostMapping
    public ResponseEntity<Order> placeOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order createdOrder = orderService.placeOrder(orderRequest.getUserId(), orderRequest.getCartItems());
            return new ResponseEntity<>(createdOrder, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            // This will catch errors like "User not found" or "MenuItem not found"
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * API endpoint to get all orders for a specific user.
     * @param userId The ID of the user.
     * @return A list of orders for that user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUser(@PathVariable int userId) {
        List<Order> orders = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * API endpoint for staff to get all orders.
     * @return A list of all orders.
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    /**
     * API endpoint for staff to update the status of an order.
     * @param id The ID of the order to update.
     * @param status The new status in the request body (e.g., {"status": "Ready"}).
     * @return The updated order.
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable int id, @RequestBody Map<String, String> status) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(id, status.get("status"));
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

/**
 * A simple helper class (Data Transfer Object) to represent the structure
 * of the JSON request body when placing an order.
 */
@Data
class OrderRequest {
    private int userId;
    private Map<Integer, Integer> cartItems; // Key: menuItemId, Value: quantity
}
