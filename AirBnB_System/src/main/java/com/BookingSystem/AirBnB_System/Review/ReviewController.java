package com.BookingSystem.AirBnB_System.Review;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@Validated
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    /**
     * Guests create a review for a booking (only after completed).
     */
    @PreAuthorize("hasAuthority('GUEST')")
    @PostMapping
    public ResponseEntity<ReviewDTO> createReview(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody @Validated CreateReviewRequest req
    ) {
        String email = principal.getUsername();
        ReviewDTO dto = service.createReview(req, email);
        return ResponseEntity.status(201).body(dto);
    }

    /**
     * Host responds to a review (host of the property) — or ADMIN.
     */
    @PreAuthorize("hasAuthority('HOST') or hasAuthority('ADMIN')")
    @PostMapping("/{reviewId}/response")
    public ResponseEntity<ReviewDTO> respondToReview(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID reviewId,
            @RequestBody @Validated RespondReviewRequest req
    ) {
        String email = principal.getUsername();
        ReviewDTO dto = service.hostRespond(reviewId, req.getResponse(), email);
        return ResponseEntity.ok(dto);
    }

    /**
     * Public (or authenticated) endpoint to list reviews for a property.
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<ReviewDTO>> getPropertyReviews(@PathVariable UUID propertyId) {
        return ResponseEntity.ok(service.getReviewsForProperty(propertyId));
    }

    /**
     * User's own reviews.
     */
    @PreAuthorize("hasAnyAuthority('GUEST','HOST','ADMIN')")
    @GetMapping("/user/me")
    public ResponseEntity<List<ReviewDTO>> getMyReviews(@AuthenticationPrincipal UserDetails principal) {
        String email = principal.getUsername();
        // need user id -> you can fetch userId via repo or extend service to accept email.
        // For simplicity, the service method `getReviewsForUser` expects userId; call via repo here:
        // but to avoid leaking internals, you could add a service method to fetch by email instead.
        throw new UnsupportedOperationException("Call service.getReviewsForUser by userId — add helper if needed.");
    }
}

