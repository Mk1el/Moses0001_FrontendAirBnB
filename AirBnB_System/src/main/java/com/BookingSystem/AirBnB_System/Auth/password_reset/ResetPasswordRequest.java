package com.BookingSystem.AirBnB_System.Auth.password_reset;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String email;
    private String newPassword;
    private String confirmPassword;
}
