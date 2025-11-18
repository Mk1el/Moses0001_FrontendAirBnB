package com.BookingSystem.AirBnB_System.Auth;import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class RegisterResponse {
    private UUID userId;
    private String email;
    private String role;
}
