package com.BookingSystem.AirBnB_System.Review;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReviewDTO {
    private UUID reviewId;
    private UUID propertyId;
    private UUID userId;
    private UUID bookingId;
    private Integer rating;
    private String comment;
    private String hostResponse;
    private LocalDateTime hostRespondedAt;
    private LocalDateTime createdAt;
    private String userEmail; // optional helpful field

    // getters & setters
    public UUID getReviewId() { return reviewId; }
    public void setReviewId(UUID reviewId) { this.reviewId = reviewId; }
    public UUID getPropertyId() { return propertyId; }
    public void setPropertyId(UUID propertyId) { this.propertyId = propertyId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public UUID getBookingId() { return bookingId; }
    public void setBookingId(UUID bookingId) { this.bookingId = bookingId; }
    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getHostResponse() { return hostResponse; }
    public void setHostResponse(String hostResponse) { this.hostResponse = hostResponse; }
    public LocalDateTime getHostRespondedAt() { return hostRespondedAt; }
    public void setHostRespondedAt(LocalDateTime hostRespondedAt) { this.hostRespondedAt = hostRespondedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}

