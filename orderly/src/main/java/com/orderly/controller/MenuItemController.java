package com.orderly.controller;

import com.orderly.model.MenuItem;
import com.orderly.service.MenuItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    @Autowired
    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public List<MenuItem> getAllMenuItems() {
        return menuItemService.getAllMenuItems();
    }

    // --- THIS IS THE NEW METHOD ---
    /**
     * API endpoint to fetch a single menu item by its ID.
     * Used by the staff dashboard to populate the edit form.
     * @param id The ID of the menu item.
     * @return The menu item if found, otherwise a 404 Not Found response.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable int id) {
        return menuItemService.getMenuItemById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    // --- END OF NEW METHOD ---

    @PostMapping
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItem menuItem) {
        MenuItem createdItem = menuItemService.createMenuItem(menuItem);
        return new ResponseEntity<>(createdItem, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable int id, @RequestBody MenuItem menuItemDetails) {
        try {
            MenuItem updatedItem = menuItemService.updateMenuItem(id, menuItemDetails);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable int id) {
        // Note: The logic for this is in staff.js (soft delete)
        // This endpoint will be called by a future admin tool if needed for a hard delete.
        // For now, it remains but the UI doesn't use it for a hard delete.
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}