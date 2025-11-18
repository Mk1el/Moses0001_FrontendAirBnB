package com.BookingSystem.AirBnB_System.Review;

import com.BookingSystem.AirBnB_System.Auth.User;
import com.BookingSystem.AirBnB_System.Auth.UserRepository;
import com.BookingSystem.AirBnB_System.Booking.Booking;
import com.BookingSystem.AirBnB_System.Booking.BookingRepository;
import com.BookingSystem.AirBnB_System.Booking.BookingStatus;
import com.BookingSystem.AirBnB_System.Property.Property;
import com.BookingSystem.AirBnB_System.Property.PropertyRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepo;
    private final BookingRepository bookingRepo;
    private final PropertyRepository propertyRepo;
    private final UserRepository userRepo;

    public ReviewService(ReviewRepository reviewRepo,
                         BookingRepository bookingRepo,
                         PropertyRepository propertyRepo,
                         UserRepository userRepo) {
        this.reviewRepo = reviewRepo;
        this.bookingRepo = bookingRepo;
        this.propertyRepo = propertyRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public ReviewDTO createReview(CreateReviewRequest req, String userEmail) {
        Booking booking = bookingRepo.findById(req.getBookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new SecurityException("You can only review your own bookings");
        }
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalStateException("You can only review after booking is completed");
        }
        if (reviewRepo.existsByBooking_BookingId(booking.getBookingId())) {
            throw new IllegalStateException("A review for this booking already exists");
        }
        Property property = booking.getProperty();
        User user = booking.getUser();

        Review review = Review.builder()
                .property(property)
                .user(user)
                .booking(booking)
                .rating(req.getRating())
                .comment(req.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        Review saved = reviewRepo.save(review);
        return toDTO(saved);
    }
    @Transactional
    public ReviewDTO hostRespond(UUID reviewId, String response, String hostEmail) {
        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("Review not found"));

        // ensure the responding user is the host of that property (or admin logic could go here)
        User host = userRepo.findByEmail(hostEmail).orElseThrow();
        if (!review.getProperty().getHost().getUserId().equals(host.getUserId()) && !host.getRole().name().equals("ADMIN")) {
            throw new SecurityException("Only the property's host or an admin may respond to this review");
        }

        review.setHostResponse(response);
        review.setHostRespondedAt(LocalDateTime.now());
        Review saved = reviewRepo.save(review);
        return toDTO(saved);
    }

    public List<ReviewDTO> getReviewsForProperty(UUID propertyId) {
        return reviewRepo.findByProperty_PropertyIdOrderByCreatedAtDesc(propertyId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<ReviewDTO> getReviewsForUser(UUID userId) {
        return reviewRepo.findByUser_UserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public ReviewDTO toDTO(Review r) {
        ReviewDTO dto = new ReviewDTO();
        dto.setReviewId(r.getReviewId());
        dto.setPropertyId(r.getProperty().getPropertyId());
        dto.setUserId(r.getUser().getUserId());
        dto.setBookingId(r.getBooking().getBookingId());
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setHostResponse(r.getHostResponse());
        dto.setHostRespondedAt(r.getHostRespondedAt());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setUserEmail(r.getUser().getEmail());
        return dto;
    }
}