package com.BookingSystem.AirBnB_System.Auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserDTO {
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String role;
    private String profilePhotoPath;
    private Instant createdAt;
}
