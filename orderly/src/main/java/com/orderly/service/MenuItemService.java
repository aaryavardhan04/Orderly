package com.orderly.service;

import com.orderly.model.MenuItem;
import com.orderly.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    @Autowired
    public MenuItemService(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
    }

    /**
     * Fetches all menu items from the database.
     * @return a list of all menu items.
     */
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }

    /**
     * Fetches a single menu item by its ID.
     * @param id The ID of the menu item.
     * @return an Optional containing the menu item if found.
     */
    public Optional<MenuItem> getMenuItemById(int id) {
        return menuItemRepository.findById(id);
    }

    /**
     * Saves a new menu item to the database.
     * @param menuItem The menu item to be created.
     * @return the saved menu item.
     */
    public MenuItem createMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }

    /**
     * Deletes a menu item from the database.
     * @param id The ID of the menu item to be deleted.
     */
    public void deleteMenuItem(int id) {
        menuItemRepository.deleteById(id);
    }

    /**
     * Updates an existing menu item.
     * @param id The ID of the menu item to update.
     * @param menuItemDetails The new details for the menu item.
     * @return the updated menu item.
     */
    public MenuItem updateMenuItem(int id, MenuItem menuItemDetails) {
        // First, find the existing menu item by its ID.
        // If it's not found, throw an exception.
        MenuItem existingMenuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MenuItem not found with id: " + id));

        // Update the fields of the existing menu item with the new details.
        existingMenuItem.setName(menuItemDetails.getName());
        existingMenuItem.setPrice(menuItemDetails.getPrice());
        existingMenuItem.setPrepTime(menuItemDetails.getPrepTime());
        existingMenuItem.setImageUrl(menuItemDetails.getImageUrl());
        existingMenuItem.setCategory(menuItemDetails.getCategory());
        existingMenuItem.setAvailable(menuItemDetails.isAvailable());

        // Save the updated menu item back to the database.
        return menuItemRepository.save(existingMenuItem);
    }
}
