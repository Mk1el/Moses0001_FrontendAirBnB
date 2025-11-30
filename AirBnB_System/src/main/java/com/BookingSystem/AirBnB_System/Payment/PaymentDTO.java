package com.BookingSystem.AirBnB_System.Payment;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
public class PaymentDTO {
    private UUID paymentId;
    private UUID bookingId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private Instant paymentDate;
}

