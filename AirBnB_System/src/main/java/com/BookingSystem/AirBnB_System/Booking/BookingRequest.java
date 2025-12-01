package com.BookingSystem.AirBnB_System.Booking;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    private String propertyId; // string UUID
    private LocalDate startDate;
    private LocalDate endDate;
}

