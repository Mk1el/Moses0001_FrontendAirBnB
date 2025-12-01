package com.BookingSystem.AirBnB_System.Payment;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentRequest {
    private String bookingId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private String phoneNumber;
    private String returnUrl;
    private String cancelUrl;
}
