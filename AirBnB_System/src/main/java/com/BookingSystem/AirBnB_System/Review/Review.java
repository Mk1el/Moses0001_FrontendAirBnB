package com.BookingSystem.AirBnB_System.Review;

import com.BookingSystem.AirBnB_System.Auth.User;
import com.BookingSystem.AirBnB_System.Booking.Booking;
import com.BookingSystem.AirBnB_System.Property.Property;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;


@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @Column(name = "review_id", nullable = false, updatable = false)
    private UUID reviewId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    @Min(1)
    @Max(5)
    @NotNull
    @Column(nullable = false)
    private Integer rating;

    @NotBlank
    @Size(max = 2000)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String comment;

    // Host's response (nullable)
    @Column(columnDefinition = "TEXT")
    private String hostResponse;

    private LocalDateTime hostRespondedAt;

    @NotNull
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (reviewId == null) reviewId = UUID.randomUUID();
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
