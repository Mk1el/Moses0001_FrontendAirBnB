package com.BookingSystem.AirBnB_System.Booking;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from Booking b where b.bookingId = :id")
    Optional<Booking> findByIdForUpdate(@Param("id") UUID id);
    // find bookings overlapping a date range (excluding canceled)
    List<Booking> findByProperty_PropertyIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            UUID propertyId,
            List<BookingStatus> statuses,
            LocalDate endDate,
            LocalDate startDate
    );

    List<Booking> findByUser_UserId(UUID userId);
    List<Booking> findByStatus(BookingStatus status);
    List<Booking> findByProperty_Host_UserId(UUID hostId);
}
