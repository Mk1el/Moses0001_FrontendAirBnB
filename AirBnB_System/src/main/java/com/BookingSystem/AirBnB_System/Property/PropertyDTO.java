package com.BookingSystem.AirBnB_System.Property;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PropertyDTO(
        UUID propertyId,
        UUID hostId,
        String hostEmail,
        String name,
        String description,
        String location,
        BigDecimal pricePerNight,
        String currency,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
