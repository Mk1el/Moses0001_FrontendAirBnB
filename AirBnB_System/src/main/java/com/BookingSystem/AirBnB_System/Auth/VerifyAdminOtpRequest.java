package com.BookingSystem.AirBnB_System.Auth;

import lombok.Data;

@Data
public class VerifyAdminOtpRequest {
    private String email;
    private String otp;
    private String password;
}
