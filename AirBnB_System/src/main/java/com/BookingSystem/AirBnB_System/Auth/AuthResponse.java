package com.BookingSystem.AirBnB_System.Auth;

public record AuthResponse(String accessToken, String tokenType, String expiresIn) {
}
