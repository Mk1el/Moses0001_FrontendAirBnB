package com.BookingSystem.AirBnB_System.Property;

import com.BookingSystem.AirBnB_System.Auth.UserRepository;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@SecurityRequirement(name = "BearerAuth")
public class PropertyController {

    private final PropertyService service;
    private final UserRepository repo;

    public PropertyController(PropertyService service, UserRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @PostMapping
    @PreAuthorize("hasAuthority('HOST') or hasAuthority('ADMIN')")
    public ResponseEntity<?> create(
            @AuthenticationPrincipal UserDetails principal,
            @RequestBody PropertyRequest request
    ) {

        var user = repo.findByEmail(principal.getUsername()).orElseThrow();
        return ResponseEntity.ok(
                service.create(
                        user.getUserId(),
                        request.getName(),
                        request.getDescription(),
                        request.getLocation(),
                        request.getPricePerNight(),
                        request.getCurrency()
                )
        );
    }

    @PreAuthorize("hasAuthority('HOST')")
    @PutMapping("/{id}")
    public ResponseEntity<?> edit(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id,
            @RequestBody PropertyRequest request
    ) {
        UUID hostId = repo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        return ResponseEntity.ok(
                service.update(
                        hostId,
                        id,
                        request.getName(),
                        request.getDescription(),
                        request.getLocation(),
                        request.getPricePerNight(),
                        request.getCurrency()
                )
        );
    }

    @PreAuthorize("hasAuthority('HOST')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable UUID id
    ) {
        UUID hostId = repo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        service.delete(hostId, id);
        return ResponseEntity.ok("Deleted!");
    }
    @PreAuthorize("hasAuthority('HOST')")
    @GetMapping("/host/my-properties")
    public ResponseEntity<?> getMyProperties(
            @AuthenticationPrincipal UserDetails principal
    ) {
        UUID hostId = repo.findByEmail(principal.getUsername()).orElseThrow().getUserId();
        return ResponseEntity.ok(service.getHostProperties(hostId));
    }
    @PreAuthorize("hasAuthority('GUEST')")
    @GetMapping("/guest/all-properties")
    public ResponseEntity<?>getAllProperties(){
        return ResponseEntity.ok(service.getAllProperties());
    }
    @PreAuthorize("hasAnyAuthority('ADMIN','HOST','GUEST')")
    @GetMapping("/search")
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String price,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) String description
    )
    {
        return ResponseEntity.ok(service.searchProperties(location, price, minPrice, maxPrice, guests, description));
    }
    @PreAuthorize("hasAnyAuthority('ADMIN','HOST','GUEST')")
    @GetMapping("/available")
    public ResponseEntity<?> getAvailable(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(service.getAvailable(startDate, endDate));
            }

    // ADMIN
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/all")
    public ResponseEntity<?> adminViewAll() {
        return ResponseEntity.ok(service.adminAll());
    }
}


