package com.BookingSystem.AirBnB_System.Payment;

import com.BookingSystem.AirBnB_System.Booking.Booking;
import com.BookingSystem.AirBnB_System.Booking.BookingDTO;
import com.BookingSystem.AirBnB_System.Booking.BookingRepository;
import com.BookingSystem.AirBnB_System.Booking.BookingStatus;
import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepo;
    private final BookingRepository bookingRepo;
    private final MpesaService mpesaService;
    private final PaypalService paypalService;
    private final AirtelService airtelService;

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    @Value("${stripe.secret-key:}")
    private String stripeSecretKey;

    /**
     * How long to consider a PENDING payment "in progress" before treating it as stale (minutes).
     * Tune in application.properties (default 5).
     */
    @Value("${payments.pending-timeout-minutes:5}")
    private long pendingTimeoutMinutes;

    public PaymentService(
            PaymentRepository paymentRepo,
            BookingRepository bookingRepo,
            MpesaService mpesaService,
            PaypalService paypalService,
            AirtelService airtelService
    ) {
        this.paymentRepo = paymentRepo;
        this.bookingRepo = bookingRepo;
        this.mpesaService = mpesaService;
        this.paypalService = paypalService;
        this.airtelService = airtelService;
    }

    /**
     * Initiate a payment request for a booking
     */
    @Transactional
    public PaymentResponse processPayment(
            UUID bookingId,
            BigDecimal amount,
            PaymentMethod method,
            String phoneNumber,
            String returnUrl,
            String cancelUrl
    ) {
        // NOTE: if you have a findByIdForUpdate(...) implementation on the repository that applies
        // a PESSIMISTIC_WRITE lock, prefer to use it here. To keep this code general we call findById.
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found!"));

        if (booking.getTotalPrice().compareTo(amount) != 0) {
            throw new IllegalArgumentException("Payment amount does not match booking total");
        }

        // --- 1) Prevent duplicates / reuse failed payment: check latest payment for this booking ---
        Optional<Payment> lastOpt = paymentRepo.findTopByBooking_BookingIdOrderByCreatedAtDesc(bookingId);

        Payment payment = null;

        if (lastOpt.isPresent()) {
            Payment last = lastOpt.get();
            // If last is PENDING -> either it's stale (mark FAILED) or block the attempt
            if (last.getStatus() == PaymentStatus.PENDING) {
                Instant created = last.getCreatedAt(); // assumes createdAt is Instant
                if (created != null && created.isBefore(Instant.now().minus(Duration.ofMinutes(pendingTimeoutMinutes)))) {
                    // stale pending payment -> mark it FAILED and allow a new attempt (we will create a new Payment below)
                    log.warn("Found stale pending payment (older than {} min). Marking FAILED. paymentId={}",
                            pendingTimeoutMinutes, last.getPaymentId());
                    last.setStatus(PaymentStatus.FAILED);
                    paymentRepo.save(last);
                } else {
                    // active in-progress payment exists — block duplicate attempt
                    throw new IllegalStateException("A payment is already in progress for this booking. Please wait.");
                }
            } else if (last.getStatus() == PaymentStatus.SUCCESS) {
                // booking already paid — do not allow new payment
                throw new IllegalStateException("Booking already paid for. No new payment is required.");
            } else if (last.getStatus() == PaymentStatus.FAILED) {
                // Reuse the FAILED payment record: reset to PENDING and update fields instead of inserting a new row.
                log.info("Reusing previous FAILED payment for booking {} — updating it to PENDING and continuing.", bookingId);
                last.setStatus(PaymentStatus.PENDING);
                last.setAmount(amount);
                last.setPaymentMethod(method);
                last.setPaymentDate(Instant.now());
                last.setExternalTransactionId(null);
                // save it (update) and continue
                try {
                    payment = paymentRepo.save(last);
                } catch (DataIntegrityViolationException dive) {
                    // concurrent race — try to recover by fetching latest again
                    log.warn("DataIntegrityViolation when updating failed payment — trying to recover. bookingId={} error={}",
                            bookingId, dive.getMessage());
                    Optional<Payment> concurrent = paymentRepo.findTopByBooking_BookingIdOrderByCreatedAtDesc(bookingId);
                    if (concurrent.isPresent()) {
                        payment = concurrent.get();
                    } else {
                        throw dive;
                    }
                }
            }
            // otherwise: other statuses fall through and we create new payment if payment==null
        }

        // If we didn't reuse an existing payment (payment == null), create a new pending payment record
        if (payment == null) {
            payment = Payment.builder()
                    .booking(booking)
                    .amount(amount)
                    .paymentMethod(method)
                    .status(PaymentStatus.PENDING)
                    .paymentDate(Instant.now())
                    .build();

            // Attempt to save - handle race where two threads may try to insert simultaneously
            try {
                payment = paymentRepo.save(payment);
            } catch (DataIntegrityViolationException dive) {
                // Could be the duplicate-key you saw (concurrent insert). Recover: find latest and return it.
                log.warn("DataIntegrityViolation when inserting payment — possible concurrent insert. bookingId={} error={}",
                        bookingId, dive.getMessage());

                Optional<Payment> concurrent = paymentRepo.findTopByBooking_BookingIdOrderByCreatedAtDesc(bookingId);
                if (concurrent.isPresent()) {
                    Payment existing = concurrent.get();
                    PaymentResponse resp = new PaymentResponse();
                    resp.setPaymentId(existing.getPaymentId().toString());
                    resp.setStatus(existing.getStatus());
                    resp.setMessage("An existing payment was created concurrently. Use that payment or try again.");
                    // Optionally include externalTransactionId if present:
                    // resp.setExternalTransactionId(existing.getExternalTransactionId());
                    return resp;
                }

                // If we couldn't recover, rethrow so caller sees the failure
                throw dive;
            }
        }

        // Mark booking as waiting for money (payment started)
        booking.setStatus(BookingStatus.WAITING_MONEY);
        bookingRepo.save(booking);

        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(payment.getPaymentId().toString());
        response.setStatus(payment.getStatus());

        try {
            switch (method) {
                case STRIPE -> handleStripePayment(payment, booking, amount, response);
                case MPESA -> handleMpesaPayment(payment, booking, amount, phoneNumber, response);
                case PAYPAL -> handlePaypalPayment(payment, booking, amount, returnUrl, cancelUrl, response);
                case AIRTEL -> handleAirtelPayment(payment, booking, amount, phoneNumber, response);
                default -> throw new IllegalArgumentException("Unsupported payment method");
            }
        } catch (Exception e) {
            // mark payment failed and roll booking back to PENDING
            log.error("Payment initiation error for paymentId={}. Marking payment FAILED and booking PENDING", payment.getPaymentId(), e);
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepo.save(payment);

            booking.setStatus(BookingStatus.PENDING);
            bookingRepo.save(booking);

            throw new RuntimeException("Payment initiation failed: " + e.getMessage(), e);
        }

        return response;
    }

    // 🔹 Stripe Payment Handling
    private void handleStripePayment(Payment payment, Booking booking, BigDecimal amount, PaymentResponse resp) throws Exception {
        Stripe.apiKey = stripeSecretKey;
        long amountInCents = amount.multiply(new BigDecimal(100)).longValue();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(booking.getProperty().getCurrency() == null ? "kes" : booking.getProperty().getCurrency().toLowerCase())
                .putMetadata("bookingId", booking.getBookingId().toString())
                .putMetadata("paymentId", payment.getPaymentId().toString())
                .build();

        PaymentIntent intent = PaymentIntent.create(params);
        payment.setExternalTransactionId(intent.getId());
        paymentRepo.save(payment);

        resp.setStripeClientSecret(intent.getClientSecret());
        resp.setMessage("Stripe PaymentIntent created. Confirm on client.");
    }

    // 🔹 M-Pesa Payment Handling
    private void handleMpesaPayment(Payment payment, Booking booking, BigDecimal amount, String phoneNumber, PaymentResponse resp) {
        var stkResp = mpesaService.stkPush(booking, amount, phoneNumber, payment.getPaymentId().toString());
        payment.setExternalTransactionId(stkResp.getCheckoutRequestID());
        paymentRepo.save(payment);

        resp.setMpesaCheckoutRequestId(stkResp.getCheckoutRequestID());
        resp.setMessage("M-Pesa STK Push initiated. Awaiting callback.");
    }

    // 🔹 PayPal Payment Handling
    private void handlePaypalPayment(Payment payment, Booking booking, BigDecimal amount, String returnUrl, String cancelUrl, PaymentResponse resp) {
        var order = paypalService.createOrder(booking, amount, returnUrl, cancelUrl, payment.getPaymentId().toString());
        payment.setExternalTransactionId(order.getOrderId());
        paymentRepo.save(payment);

        resp.setPaypalApprovalUrl(order.getApprovalUrl());
        resp.setMessage("PayPal order created. Redirect user to approval URL.");
    }

    // 🔹 Airtel Money Payment Handling
    private void handleAirtelPayment(Payment payment, Booking booking, BigDecimal amount, String phoneNumber, PaymentResponse resp) {
        var airtelResp = airtelService.requestPayment(booking, amount, phoneNumber, payment.getPaymentId().toString());
        payment.setExternalTransactionId(airtelResp.getTransactionId());
        paymentRepo.save(payment);

        resp.setMessage("Airtel Money payment requested. Check transaction progress.");
    }

    public List<BookingDTO> getAwaitingPaymentBookings() {
        // find all bookings with booking.status == PENDING
        List<Booking> pendingBookings = bookingRepo.findByStatus(BookingStatus.PENDING);

        return pendingBookings.stream()
                // exclude bookings that already have a successful payment
                .filter(b -> {
                    try {
                        // preferred repository method — define this in PaymentRepository
                        return !paymentRepo.existsByBooking_BookingIdAndStatus(b.getBookingId(), PaymentStatus.SUCCESS);
                    } catch (Throwable ignored) {
                        // fallback: query payments for this booking and check if any successful
                        List<Payment> payments = paymentRepo.findByBooking_BookingIdAndStatus(b.getBookingId(), PaymentStatus.SUCCESS);
                        return payments == null || payments.isEmpty();
                    }
                })
                // map Booking -> BookingDTO
                .map(b -> {
                    BookingDTO dto = new BookingDTO();
                    dto.setBookingId(b.getBookingId());
                    dto.setPropertyId(b.getProperty().getPropertyId());
                    dto.setUserId(b.getUser().getUserId());
                    dto.setStartDate(b.getStartDate());
                    dto.setEndDate(b.getEndDate());
                    dto.setTotalPrice(b.getTotalPrice());
                    dto.setStatus(b.getStatus());
                    dto.setCreatedAt(b.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }



    /**
     * 🔹 Webhook / Callback handler for all gateways
     */
    @Transactional
    public void handleExternalPaymentResult(String externalTransactionId, boolean success, String gatewayReference, String note) {
        var maybePayment = paymentRepo.findByExternalTransactionId(externalTransactionId);
        if (maybePayment.isEmpty()) {
            // log unrecognized payment for review
            log.warn("Received callback for unknown externalTransactionId={}", externalTransactionId);
            return;
        }

        Payment payment = maybePayment.get();
        // from PaymentService:
        payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setExternalTransactionId(gatewayReference);
        if (success) payment.setPaymentDate(Instant.now());
        paymentRepo.save(payment);

        Booking booking = payment.getBooking();
        if (success) {
            booking.setStatus(BookingStatus.CONFIRMED);
        } else {
            // payment failed externally — roll booking back to PENDING so user can try again
            booking.setStatus(BookingStatus.PENDING);
        }
        bookingRepo.save(booking);
    }

}
