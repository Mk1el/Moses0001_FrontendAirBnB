package com.BookingSystem.AirBnB_System.Payment;

import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;


@Data

public class PaidGuestDTO {
    private UUID bookingId;
    private UUID guestId;
    private String guestFirstName;
    private String guestLastName;
    private String guestEmail;
    private String guestPhone;
    private UUID propertyId;
    private String propertyName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private Instant paymentDate;
    private String externalTransactionId;
}
