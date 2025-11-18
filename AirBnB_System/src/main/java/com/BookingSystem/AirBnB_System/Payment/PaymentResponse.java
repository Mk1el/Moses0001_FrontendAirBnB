package com.BookingSystem.AirBnB_System.Payment;


import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private String paymentId;
    private PaymentStatus status;
    private String stripeClientSecret;
    private String mpesaCheckoutRequestId;
    private String paypalApprovalUrl;
    private String message;
}
