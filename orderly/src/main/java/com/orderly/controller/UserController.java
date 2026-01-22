package com.orderly.controller;

import com.orderly.model.User;
import com.orderly.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * API endpoint for user registration.
     * @param user The user details from the request body.
     * @return The created user.
     */
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        // Check if the username already exists
        if (userService.findUserByUsername(user.getUsername()).isPresent()) {
            // Return a conflict status if the username is taken
            return new ResponseEntity<>(HttpStatus.CONFLICT);
        }
        User createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    // We will add the /login endpoint later when we configure security properly.
}
