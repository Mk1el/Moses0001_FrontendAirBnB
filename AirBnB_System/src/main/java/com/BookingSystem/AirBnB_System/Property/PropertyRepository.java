package com.BookingSystem.AirBnB_System.Property;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByHost_UserId(UUID hostId);
    List<Property> findByHostUserId(UUID hostId);
    @Query("""
        SELECT p FROM Property p
        WHERE (:location IS NULL OR LOWER(p.location) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:minPrice IS NULL OR p.pricePerNight >= :minPrice)
          AND (:maxPrice IS NULL OR p.pricePerNight <= :maxPrice)
          AND (:description IS NULL OR LOWER(p.description) LIKE LOWER(CONCAT('%', :description, '%')))
    """)
    List <Property>searchProperties(
            @Param("location") String location,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("guests") Integer guests,
            @Param("description") String description
    );

}
