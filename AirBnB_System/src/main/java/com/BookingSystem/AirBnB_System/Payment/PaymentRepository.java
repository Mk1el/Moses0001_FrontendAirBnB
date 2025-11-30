package com.BookingSystem.AirBnB_System.Payment;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    boolean existsByBooking_BookingIdAndStatus(UUID bookingId, PaymentStatus status);

    List<Payment> findByBooking_BookingIdAndStatus(UUID bookingId, PaymentStatus status);

    Optional<Payment> findTopByBooking_BookingIdOrderByCreatedAtDesc(UUID bookingId);

    Optional<Payment> findByExternalTransactionId(String externalTransactionId);

    List<Payment> findByBooking_User_UserIdAndStatus(UUID userId, PaymentStatus status);
    List<Payment> findByBooking_Property_Host_UserIdAndStatus(UUID hostId, PaymentStatus status);
    List<Payment> findByStatus(PaymentStatus status);
}
