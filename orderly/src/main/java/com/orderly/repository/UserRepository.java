package com.orderly.repository;

import com.orderly.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    // Custom method to find a user by their username
    // Spring Data JPA automatically implements this method based on its name
    Optional<User> findByUsername(String username);
}
