package com.BookingSystem.AirBnB_System.Auth;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@SecurityRequirement(name = "BearerAuth")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // Get all users
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Get total number of users
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalUsers() {
        return ResponseEntity.ok(userService.getTotalUsers());
    }

    // Activate a user
    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{userId}/activate")
    public ResponseEntity<UserDTO> activateUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.activateUser(userId));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PatchMapping("/{userId}/deactivate")
    public ResponseEntity<UserDTO> deactivateUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(userService.deactivateUser(userId));
    }
}

