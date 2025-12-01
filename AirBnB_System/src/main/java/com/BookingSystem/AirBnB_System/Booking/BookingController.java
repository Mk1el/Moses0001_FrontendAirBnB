package com.BookingSystem.AirBnB_System.Booking;

import com.BookingSystem.AirBnB_System.Auth.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@SecurityRequirement(name = "BearerAuth")
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepo;

    public BookingController(BookingService bookingService, UserRepository userRepo) {
        this.bookingService = bookingService;
        this.userRepo = userRepo;
    }

    // 🔹 Guest creates a booking
    @PreAuthorize("hasAuthority('GUEST')")
    @PostMapping("/create")
    public ResponseEntity<?> createBooking(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody BookingRequest request
    ) {
        UUID userId = userRepo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        var booking = bookingService.createBooking(
                userId,
                UUID.fromString(request.getPropertyId()),
                request.getStartDate(),
                request.getEndDate()
        );
//        System.out.println("Received booking request from frontend:");
//        System.out.println("Property ID: " + request.getPropertyId());
//        System.out.println("Start Date: " + request.getStartDate());
//        System.out.println("End Date: " + request.getEndDate());
//        System.out.println("User: " + principal.getName());

        return ResponseEntity.ok(bookingService.toDTO(booking));
    }
    @PreAuthorize("hasAuthority('GUEST')")
    @GetMapping("/me/paid")
    public ResponseEntity<?>myPaidBookings(@AuthenticationPrincipal UserDetails principal) {
        UUID userId = userRepo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        return ResponseEntity.ok(bookingService.getPaidBookingsForUser(userId));
    }
    @PreAuthorize("hasAnyAuthority('GUEST','HOST','ADMIN')")
    @PostMapping("/{id}/mark-failed")
    public ResponseEntity<?> markBookingPaymentFailed(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails principal
    ) {
        // get caller's userId (throws if email not found)
        UUID callerUserId = userRepo.findByEmail(principal.getUsername()).orElseThrow().getUserId();

        // let the service handle permission checks (owner/admin/host)
        return ResponseEntity.ok(bookingService.markPaymentFailed(id, callerUserId));
    }
    @PreAuthorize("hasAuthority('HOST')")
    @GetMapping("/host/paid-guests")
    public ResponseEntity<?> hostPaidGuests(@AuthenticationPrincipal UserDetails principal) {
        UUID hostId = userRepo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        return ResponseEntity.ok(bookingService.getPaidGuestsForHost(hostId));
    }
    // Admin: list all paid bookings
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/paid")
    public ResponseEntity<?> allPaidBookings() {
        return ResponseEntity.ok(bookingService.getAllPaidBookings());
    }

    // 🔹 View my bookings (Guest)
    @PreAuthorize("hasAuthority('GUEST')")
    @GetMapping("/me")
    public ResponseEntity<?> myBookings(@AuthenticationPrincipal UserDetails principal) {
        UUID userId = userRepo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        return ResponseEntity.ok(bookingService.getBookingsForUser(userId));

    }

    //  View bookings for a host’s properties
    @PreAuthorize("hasAuthority('HOST')")
    @GetMapping("/host/my")
    public ResponseEntity<?> hostBookings(@AuthenticationPrincipal UserDetails principal) {
        UUID hostId = userRepo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        return ResponseEntity.ok(bookingService.getBookingsForHost(hostId));
    }

    //  Cancel booking (Guest or Host)
    @PreAuthorize("hasAnyAuthority('GUEST', 'HOST', 'ADMIN')")
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.cancelBooking(id));
    }

    // Confirm booking (Host)
    @PreAuthorize("hasAuthority('HOST')")
    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmBooking(@PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.confirmBooking(id));
    }

    // Admin CRUD operations
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<?> allBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable UUID id) {
        bookingService.deleteBooking(id);
        return ResponseEntity.ok("Booking deleted successfully");
    }
    @PreAuthorize("hasAuthority('GUEST")
    @GetMapping("/me/awaiting-payment")
    public ResponseEntity<?> myAwaitingPaymentBookings(@AuthenticationPrincipal UserDetails principal) {
        UUID userId = userRepo.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"))
                .getUserId();

        return ResponseEntity.ok(
                bookingService.getAwaitingPaymentBookings()
                        .stream()
                        .filter(b -> b.getUserId().equals(userId))
                        .toList()
        );
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable UUID id,
            @RequestParam BookingStatus status
    ) {
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }
}
