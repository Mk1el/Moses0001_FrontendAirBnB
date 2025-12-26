package com.BookingSystem.AirBnB_System.Property;

import com.BookingSystem.AirBnB_System.Auth.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Currency;
import java.util.List;
import java.util.UUID;

@Service
public class PropertyService {

    private final PropertyRepository repo;
    private final UserRepository userRepo;

    public PropertyService(PropertyRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }

    public PropertyDTO create(UUID hostId, String name, String desc, String loc, Double price, String currency) {
        User host = userRepo.findById(hostId).orElseThrow();

        if (host.getRole() != Role.HOST)
            throw new IllegalStateException("Only hosts can create listings!");

        if (price == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }

        // Validate currency code
        if (currency != null) {
            try {
                Currency.getInstance(currency);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid currency code");
            }
        }

        Property p = Property.builder()
                .host(host)
                .name(name)
                .description(desc)
                .location(loc)
                .pricePerNight(BigDecimal.valueOf(price))
                .currency(currency != null ? currency.toUpperCase() : "USD")
                .build();

        repo.save(p);
        return toDTO(p);
    }


    public PropertyDTO update(UUID hostId, UUID propertyId, String name, String desc,
                              String loc, Double price, String currency) {

        Property p = repo.findById(propertyId).orElseThrow();

        if (!p.getHost().getUserId().equals(hostId))
            throw new IllegalStateException("Not your listing!");

        if (name != null) p.setName(name);
        if (desc != null) p.setDescription(desc);
        if (loc != null) p.setLocation(loc);
        if (price != null) p.setPricePerNight(BigDecimal.valueOf(price));

        if (currency != null) {
            try {
                Currency.getInstance(currency);
            } catch (Exception ex) {
                throw new IllegalArgumentException("Invalid currency code");
            }
            p.setCurrency(currency.toUpperCase());
        }

        repo.save(p);
        return toDTO(p);
    }

    public void delete(UUID hostId, UUID propId) {
        Property p = repo.findById(propId).orElseThrow();
        if (!p.getHost().getUserId().equals(hostId))
            throw new IllegalStateException("Not your listing!");
        repo.delete(p);
    }

    public List<PropertyDTO> adminAll() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }
    public List<PropertyDTO> getAllProperties(){
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public List<PropertyDTO> getHostProperties(UUID hostId) {
        return repo.findByHostUserId(hostId).stream()
                .map(this::toDTO)
                .toList();
    }

    private PropertyDTO toDTO(Property p) {
        return new PropertyDTO(
                p.getPropertyId(),
                p.getHost().getUserId(),
                p.getHost().getEmail(),
                p.getName(),
                p.getDescription(),
                p.getLocation(),
                p.getPricePerNight(),
                p.getCurrency(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
    public List<PropertyDTO>searchProperties(String location,
                                             String price,
                                             BigDecimal minPrice,
                                             BigDecimal maxPrice,
                                             Integer guests,
                                             String description) {
        return repo.searchProperties(location,price, minPrice, maxPrice, guests, description)
                .stream()
                .map(this::toDTO)
                .toList();
    }
    public List<PropertyDTO> getAvailable(LocalDate start, LocalDate end){
        return repo.findAvailableProperties(start, end)
                .stream().map(this::toDTO).toList();
    }
}
