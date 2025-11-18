package com.BookingSystem.AirBnB_System.Booking;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class BookingDTO {
    private UUID bookingId;
    private UUID propertyId;
    private UUID userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private Instant createdAt;
}
