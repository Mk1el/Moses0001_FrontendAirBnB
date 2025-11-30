package com.BookingSystem.AirBnB_System.Review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    boolean existsByBooking_BookingId(UUID bookingId);
    List<Review> findByProperty_PropertyIdOrderByCreatedAtDesc(UUID propertyId);
    List<Review> findByUser_UserIdOrderByCreatedAtDesc(UUID userId);
}
