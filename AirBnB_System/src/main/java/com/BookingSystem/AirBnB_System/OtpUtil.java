package com.BookingSystem.AirBnB_System;

public class OtpUtil {
    public static String generateOtp() {
        int otp = 100000 + (int) (Math.random() * 900000);
        return String.valueOf(otp);
    }

}
