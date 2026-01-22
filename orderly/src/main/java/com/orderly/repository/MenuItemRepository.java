package com.orderly.repository;

import com.orderly.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Integer> {
    // Basic CRUD methods (findAll, findById, save, deleteById) are automatically inherited
}
