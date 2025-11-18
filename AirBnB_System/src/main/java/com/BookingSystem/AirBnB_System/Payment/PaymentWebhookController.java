package com.BookingSystem.AirBnB_System.Payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/webhook")
public class PaymentWebhookController {

    private final PaymentService paymentService;

    public PaymentWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // M-Pesa callback endpoint (Daraja)
    @PostMapping("/mpesa")
    public ResponseEntity<?> mpesaCallback(@RequestBody Map<String, Object> payload) {
        // Daraja wraps callback in a specific structure; simplify for sample:
        // Extract CheckoutRequestID and resultCode
        // Example: payload.get("Body") -> Map -> "stkCallback" -> Map
        try {
            Map body = (Map) payload.get("Body");
            Map stk = (Map) body.get("stkCallback");
            String checkoutRequestID = (String) stk.get("CheckoutRequestID");
            Integer resultCode = (Integer) stk.get("ResultCode");
            boolean success = (resultCode != null && resultCode == 0);

            // Note: Safaricom may return phone and MpesaReceiptNumber in CallbackMetadata
            String transactionId = checkoutRequestID; // or receipt number when available
            paymentService.handleExternalPaymentResult(checkoutRequestID, success, transactionId, stk.get("ResultDesc").toString());
        } catch (Exception e) {
            // log
        }
        return ResponseEntity.ok(Map.of("status", "received"));
    }

    // PayPal webhook (example)
    @PostMapping("/paypal")
    public ResponseEntity<?> paypalCallback(@RequestBody Map<String, Object> payload, @RequestHeader Map<String, String> headers) {
        // PayPal sends event types like PAYMENT.CAPTURE.COMPLETED etc.
        // Parse and update payment status accordingly.
        try {
            String eventType = (String) payload.get("event_type");
            Map resource = (Map) payload.get("resource");
            if ("CHECKOUT.ORDER.APPROVED".equals(eventType) || "PAYMENT.CAPTURE.COMPLETED".equals(eventType)) {
                // Extract reference id
                Map purchaseUnit = ((java.util.List<Map>) resource.getOrDefault("purchase_units", java.util.List.of())).stream().findFirst().orElse(null);
                String referenceId = null;
                if (purchaseUnit != null && purchaseUnit.get("reference_id") != null) referenceId = (String) purchaseUnit.get("reference_id");

                String orderId = (String) resource.get("id");
                // Mark as success using referenceId (which we set to paymentId during createOrder)
                if (referenceId != null) paymentService.handleExternalPaymentResult(orderId, true, orderId, "PayPal success");
            }
        } catch (Exception e) {
            // log
        }
        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
