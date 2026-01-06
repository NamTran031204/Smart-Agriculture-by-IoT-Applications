package com.iot.smartgarden.controller;

import com.iot.smartgarden.dto.LoginRequest;
import com.iot.smartgarden.dto.UserResponse;
import com.iot.smartgarden.entity.User;
import com.iot.smartgarden.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ADMIN tạo user
    @PostMapping("/register")
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        System.out.println("DEBUG LOGIN - Username received: [" + request.getUsername() + "]");
        System.out.println("DEBUG LOGIN - Password received: [" + request.getPassword() + "]");

        return userService.login(request.getUsername(), request.getPassword());
    }


    // ADMIN xem toàn bộ user
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // USER xem info của mình (demo)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public User getUser(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
