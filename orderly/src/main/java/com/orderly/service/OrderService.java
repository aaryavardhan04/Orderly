package com.orderly.service;

import com.orderly.model.Order;
import com.orderly.model.OrderItem;
import com.orderly.model.MenuItem;
import com.orderly.model.User;
import com.orderly.repository.MenuItemRepository;
import com.orderly.repository.OrderRepository;
import com.orderly.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository, MenuItemRepository menuItemRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
    }

    /**
     * Creates and saves a new order.
     * This is a transactional method, meaning if any part fails, the whole operation is rolled back.
     * @param userId The ID of the user placing the order.
     * @param cartItems A map where the key is the MenuItem ID and the value is the quantity.
     * @return The newly created order.
     */
    @Transactional
    public Order placeOrder(int userId, Map<Integer, Integer> cartItems) {
        // 1. Find the user who is placing the order.
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // 2. Create a new Order object and set its initial properties.
        Order order = new Order();
        order.setUser(user);
        order.setOrderTime(LocalDateTime.now());
        order.setStatus("Pending");
        order.setOrderItems(new ArrayList<>());

        double totalPrice = 0.0;

        // 3. Loop through each item from the cart.
        for (Map.Entry<Integer, Integer> entry : cartItems.entrySet()) {
            int menuItemId = entry.getKey();
            int quantity = entry.getValue();

            // Find the MenuItem in the database.
            MenuItem menuItem = menuItemRepository.findById(menuItemId)
                    .orElseThrow(() -> new RuntimeException("MenuItem not found with id: " + menuItemId));

            // Create a new OrderItem.
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order); // Link it to the parent order.
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(quantity);
            orderItem.setPrice(menuItem.getPrice()); // Record the price at the time of order.

            // Add the new OrderItem to the order's list of items.
            order.getOrderItems().add(orderItem);

            // 4. Add to the total price.
            totalPrice += menuItem.getPrice() * quantity;
        }

        // 5. Set the final total price on the order.
        order.setTotalPrice(totalPrice);

        // 6. Save the order. Because of cascading, the associated OrderItems will also be saved.
        return orderRepository.save(order);
    }

    /**
     * Fetches all orders placed by a specific user.
     * @param userId The ID of the user.
     * @return A list of orders.
     */
    public List<Order> getOrdersByUserId(int userId) {
        return orderRepository.findByUserId(userId);
    }

    /**
     * Fetches all orders for the staff dashboard.
     * @return A list of all orders.
     */
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    /**
     * Updates the status of an existing order.
     * @param orderId The ID of the order to update.
     * @param status The new status (e.g., "Ready", "Completed").
     * @return The updated order.
     */
    public Order updateOrderStatus(int orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        order.setStatus(status);
        return orderRepository.save(order);
    }
}
