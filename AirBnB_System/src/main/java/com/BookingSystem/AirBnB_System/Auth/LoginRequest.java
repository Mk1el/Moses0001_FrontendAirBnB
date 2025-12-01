package com.BookingSystem.AirBnB_System.Auth;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
