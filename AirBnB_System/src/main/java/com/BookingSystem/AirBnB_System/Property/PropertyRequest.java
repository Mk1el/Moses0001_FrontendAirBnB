package com.BookingSystem.AirBnB_System.Property;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyRequest {
    private String name;
    private String description;
    private String location;
    @JsonProperty("price")
    private Double pricePerNight;
    private String currency;
}
