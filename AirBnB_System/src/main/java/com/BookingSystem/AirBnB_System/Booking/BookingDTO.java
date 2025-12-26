package com.BookingSystem.AirBnB_System.Booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookingDTO {
    private UUID bookingId;
    private UUID propertyId;
    private String propertyName;
    private UUID userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private Instant createdAt;
    private long nights;
    private BigDecimal pricePerNight;
}
