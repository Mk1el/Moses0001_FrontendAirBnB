package com.BookingSystem.AirBnB_System.Auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class ProfileController {

    private final UserRepository repo;
    private final UserService userService;

    public ProfileController(UserRepository repo, UserService userService) {
        this.repo = repo;
        this.userService = userService;
    }

    // Get current logged in user profile
//    @PreAuthorize("isAuthenticated()")
//    @GetMapping("/me")
//    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal UserDetails principal) {
//        var user = repo.findByEmail(principal.getUsername()).orElseThrow();
//        return ResponseEntity.ok(
//                new UserDTO(
//                        user.getUserId(),
//                        user.getFirstName(),
//                        user.getLastName(),
//                        user.getEmail(),
//                        user.getPhoneNumber(),
//                        user.getRole().name(),
//                        user.getProfilePhotoPath(),
//                        user.getCreatedAt(),
//                        user.isActive()
//                )
//        );
//    }
//
//    // Update logged in user profile
//    @PreAuthorize("isAuthenticated()")
//    @PutMapping(value = "/me", consumes = { "multipart/form-data" })
//    public ResponseEntity<?> updateProfile(
//            @AuthenticationPrincipal UserDetails principal,
//            @RequestParam(required = false) String firstName,
//            @RequestParam(required = false) String lastName,
//            @RequestParam(required = false) String phoneNumber,
//            @RequestPart(required = false) MultipartFile photo
//    ) throws Exception {
//
//        var user = repo.findByEmail(principal.getUsername()).orElseThrow();
//        userService.updateProfile(
//                user.getUserId(),
//                firstName,
//                lastName,
//                phoneNumber,
//                photo
//        );
//
//        return ResponseEntity.ok("Profile updated successfully");
//    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal UserDetails principal){
        UserDTO user = userService.getProfile(principal.getUsername());
        return ResponseEntity.ok(user);
    }
    @PreAuthorize("isAuthenticated()")
    @PutMapping(value="/me",consumes = {"multipart/form-data"})
    public ResponseEntity<UserDTO> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @RequestPart(required = false) UpdateProfileRequest request,
            @RequestPart(required = false) MultipartFile photo
    ) throws Exception {
        UserDTO updated = userService.updateProfile(
                principal.getUsername(),
                request,
                photo
        );
        return ResponseEntity.ok(updated);
    }



}
