package com.BookingSystem.AirBnB_System.Payment;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@SecurityRequirement(name = "BearerAuth")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiate a payment for a booking
     * Handles M-Pesa, Stripe, PayPal, and Airtel Money
     */
    @PreAuthorize("hasAuthority('GUEST')")
    @PostMapping("/pay")
    public ResponseEntity<PaymentResponse> pay(@RequestBody PaymentRequest request) {
        UUID bookingId = UUID.fromString(request.getBookingId());

        PaymentResponse resp = paymentService.processPayment(
                bookingId,
                request.getAmount(),
                request.getPaymentMethod(),
                request.getPhoneNumber(),
                request.getReturnUrl(),
                request.getCancelUrl()
        );

        return ResponseEntity.ok(resp);
    }
}
