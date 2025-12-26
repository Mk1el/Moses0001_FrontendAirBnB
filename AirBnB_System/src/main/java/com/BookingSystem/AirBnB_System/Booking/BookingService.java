package com.BookingSystem.AirBnB_System.Booking;

import com.BookingSystem.AirBnB_System.Payment.PaidGuestDTO;
import com.BookingSystem.AirBnB_System.Payment.Payment;
import com.BookingSystem.AirBnB_System.Payment.PaymentRepository;
import com.BookingSystem.AirBnB_System.Payment.PaymentStatus;
import com.BookingSystem.AirBnB_System.Property.Property;
import com.BookingSystem.AirBnB_System.Property.PropertyRepository;
import com.BookingSystem.AirBnB_System.Auth.User;
import com.BookingSystem.AirBnB_System.Auth.UserRepository;
import lombok.Data;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final PropertyRepository propertyRepo;
    private final PaymentRepository paymentRepo;
    private final UserRepository userRepo;

    public BookingService(BookingRepository bookingRepo, PropertyRepository propertyRepo, PaymentRepository paymentRepo,UserRepository userRepo) {
        this.bookingRepo = bookingRepo;
        this.propertyRepo = propertyRepo;
        this.paymentRepo = paymentRepo;
        this.userRepo = userRepo;

    }

    @Transactional
    public Booking createBooking(UUID userId, UUID propertyId, LocalDate start, LocalDate end) {
        if (start == null || end == null)
            throw new IllegalArgumentException("Start and end dates are required");

        if (!end.isAfter(start))
            throw new IllegalArgumentException("End date must be after start date");

        Property property = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check overlapping bookings
        List<BookingStatus> activeStatuses = List.of(
                BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.COMPLETED
        );

        boolean hasOverlap = !bookingRepo
                .findByProperty_PropertyIdAndStatusInAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        propertyId, activeStatuses, end.minusDays(1), start.plusDays(1)
                ).isEmpty();

        if (hasOverlap)
            throw new IllegalStateException("Selected dates are not available for booking");

        long nights = ChronoUnit.DAYS.between(start, end);
        BigDecimal total = property.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Booking booking = Booking.builder()
                .property(property)
                .user(user)
                .startDate(start)
                .endDate(end)
                .totalPrice(total)
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepo.save(booking);
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepo.findAll().stream().map(this::toDTO).toList();
    }
    public List<BookingDTO> getPaidBookingsForUser(UUID userId){
        List<Payment> payments = paymentRepo.findByBooking_User_UserIdAndStatus(userId, PaymentStatus.SUCCESS);
        return payments.stream()
                .map(Payment::getBooking)
                .distinct()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PaidGuestDTO> getPaidGuestsForHost(UUID hostId) {
        List<Payment> payments = paymentRepo.findByBooking_Property_Host_UserIdAndStatus(hostId, PaymentStatus.SUCCESS);

        return payments.stream()
                .map(payment -> {
                    var b = payment.getBooking();
                    var guest = b.getUser();
                    var prop = b.getProperty();

                    PaidGuestDTO dto = new PaidGuestDTO();
                    dto.setBookingId(b.getBookingId());
                    dto.setGuestId(guest.getUserId());
                    dto.setGuestFirstName(guest.getFirstName());
                    dto.setGuestLastName(guest.getLastName());
                    dto.setGuestEmail(guest.getEmail());
                    dto.setGuestPhone(guest.getPhoneNumber());
                    dto.setPropertyId(prop.getPropertyId());
                    dto.setPropertyName(prop.getName());
                    dto.setStartDate(b.getStartDate());
                    dto.setEndDate(b.getEndDate());
                    dto.setTotalPrice(b.getTotalPrice());
                    dto.setPaymentDate(payment.getPaymentDate());
                    dto.setExternalTransactionId(payment.getExternalTransactionId());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    public List<BookingDTO> getAllPaidBookings(){
        List<Payment> payments = paymentRepo.findByStatus(PaymentStatus.SUCCESS);
        return payments.stream()
                .map(Payment::getBooking)
                .distinct()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // BookingService.java
    public List<BookingDTO> getBookingsForUser(UUID userId) {
        List<Booking> bookings = bookingRepo.findByUser_UserId(userId);

        return bookings.stream()
                .map(booking -> BookingDTO.builder()
                        .bookingId(booking.getBookingId())
                        .propertyId(booking.getProperty().getPropertyId())
                        .propertyName(booking.getProperty().getName())
                        .userId(booking.getUser().getUserId())
                        .startDate(booking.getStartDate())
                        .endDate(booking.getEndDate())
                        .totalPrice(booking.getTotalPrice())
                        .status(booking.getStatus())
                        .createdAt(booking.getCreatedAt())
                        .build()
                ).toList();
    }

    public List<BookingDTO> getAwaitingPaymentBookings() {
        List<Booking> pendingBookings = bookingRepo.findByStatus(BookingStatus.PENDING);
        return pendingBookings.stream()
                .filter(b -> {
                    // Check if a successful payment exists
                    List<Payment> payments = paymentRepo.findByBooking_BookingIdAndStatus(b.getBookingId(), PaymentStatus.SUCCESS)
                            .stream().toList();
                    return payments.isEmpty(); // only include bookings with NO successful payment
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsForHost(UUID hostId) {
        return bookingRepo.findByProperty_Host_UserId(hostId).stream().map(this::toDTO).toList();
    }

    public BookingDTO cancelBooking(UUID bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        if (booking.getStatus() == BookingStatus.CANCELED)
            throw new IllegalStateException("Booking already canceled");

        booking.setStatus(BookingStatus.CANCELED);
        bookingRepo.save(booking);
        return toDTO(booking);
    }

    public BookingDTO confirmBooking(UUID bookingId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepo.save(booking);
        return toDTO(booking);
    }

    public BookingDTO updateBookingStatus(UUID bookingId, BookingStatus status) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        booking.setStatus(status);
        return toDTO(bookingRepo.save(booking));
    }

    public void deleteBooking(UUID bookingId) {
        if (!bookingRepo.existsById(bookingId))
            throw new IllegalArgumentException("Booking not found");
        bookingRepo.deleteById(bookingId);
    }
    public static class PriceCalculationDTO{
        private long nights;
        private BigDecimal pricePerNight;
        private BigDecimal totalPrice;

        public PriceCalculationDTO(long nights, BigDecimal pricePerNight, BigDecimal totalPrice){
            this.nights = nights;
            this.pricePerNight = pricePerNight;
            this.totalPrice = totalPrice;

        }
        public long getNights() { return nights; }
        public BigDecimal getPricePerNight() { return pricePerNight; }
        public BigDecimal getTotalPrice() { return totalPrice; }
    }
    public PriceCalculationDTO calculatePrice(UUID propertyId, LocalDate start, LocalDate end) {
        if (start == null || end == null) throw new IllegalArgumentException("Start and end dates are required");
        if (!end.isAfter(start)) throw new IllegalArgumentException("End date must be after start date");

        Property property = propertyRepo.findById(propertyId)
                .orElseThrow(() -> new IllegalArgumentException("Property not found"));

        long nights = ChronoUnit.DAYS.between(start, end);
        BigDecimal total = property.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        return new PriceCalculationDTO(nights, property.getPricePerNight(), total);
    }

    public BookingDTO toDTO(Booking b) {
        BookingDTO dto = new BookingDTO();
        dto.setBookingId(b.getBookingId());
        dto.setPropertyId(b.getProperty().getPropertyId());
        dto.setUserId(b.getUser().getUserId());
        dto.setStartDate(b.getStartDate());
        dto.setEndDate(b.getEndDate());
//        dto.setTotalPrice(b.getTotalPrice());
//        dto.setStatus(b.getStatus());
//        dto.setCreatedAt(b.getCreatedAt());
        long nights = ChronoUnit.DAYS.between(b.getStartDate(), b.getEndDate());
        if(nights < 0) nights =0;
        dto.setNights(nights);
        dto.setPricePerNight(b.getProperty().getPricePerNight());
        dto.setTotalPrice(b.getTotalPrice());
        dto.setStatus(b.getStatus());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }

    @Transactional
    public BookingDTO markPaymentFailed(UUID bookingId, UUID callerUserId) {
        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));

        // allow owner, host of property, or ADMIN (if callerUserId equals owner OR host)
        boolean isOwner = booking.getUser() != null && booking.getUser().getUserId().equals(callerUserId);
        boolean isHost = booking.getProperty() != null &&
                booking.getProperty().getHost() != null &&
                booking.getProperty().getHost().getUserId().equals(callerUserId);

        // If you have a way to check ADMIN role here, you can add it. For now: owner or host allowed.
        if (!isOwner && !isHost) {
            throw new AccessDeniedException("Not authorized to mark this booking as failed");
        }

        // 1) set booking status back to PENDING so user can retry
        booking.setStatus(BookingStatus.PENDING);
        bookingRepo.save(booking);
        Optional<Payment> lastPaymentOpt = paymentRepo.findTopByBooking_BookingIdOrderByCreatedAtDesc(bookingId);
        lastPaymentOpt.ifPresent(p -> {
            p.setStatus(PaymentStatus.FAILED);
            paymentRepo.save(p);
        });

        return toDTO(booking);
    }
}
