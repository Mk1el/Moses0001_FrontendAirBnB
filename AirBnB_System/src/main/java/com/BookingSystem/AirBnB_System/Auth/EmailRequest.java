package com.BookingSystem.AirBnB_System.Auth;

import java.util.List;

public record EmailRequest(
        String from,
        List<String> to,
        String subject,
        String html
) {}

