package com.BookingSystem.AirBnB_System.Auth;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@SecurityRequirement(name = "BearerAuth")
@RequiredArgsConstructor
@CrossOrigin
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
    @PostMapping("/create-admin")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> createAdmin(
            @RequestBody CreateAdminRequest request,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User loggedUser) {
        User adminEntity = userService.findEntityByEmail(loggedUser.getUsername());
        UUID requesterId = adminEntity.getUserId();

        return ResponseEntity.ok(
                userService.createAdmin(
                        requesterId,
                        request.getFirstName(),
                        request.getLastName(),
                        request.getEmail(),
                        request.getPassword(),
                        request.getPhoneNumber()
                )
        );

    }
    @PostMapping("/verify-admin-otp")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> verifyAdminOtp(@RequestBody VerifyAdminOtpRequest request) {

        String email = request.getEmail();
        String otp = request.getOtp();
        String newPassword = request.getPassword();

        User admin = userService.findEntityByEmail(email);

        if (admin.getOtpCode() == null || !admin.getOtpCode().equals(otp)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid OTP");
        }
        if (admin.getOtpExpiry() == null || admin.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("OTP expired");
        }

        admin.setOtpVerified(true);
        admin.setActive(true);
        admin.setOtpCode(null);
        admin.setOtpExpiry(null);
        admin.setPasswordHash(new BCryptPasswordEncoder().encode(newPassword));

        userService.save(admin);

        return ResponseEntity.ok("Admin verified and activated.");
    }

}

