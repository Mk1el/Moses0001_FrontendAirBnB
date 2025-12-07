package com.BookingSystem.AirBnB_System.Auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class SmsService {

    private final WebClient webClient;

    @Value("${africastalking.username}")
    private String atUsername;

    @Value("${africastalking.api-key}")
    private String atApiKey;

    // set default base url in application.properties: africastalking.api-base=https://api.sandbox.africastalking.com
    public SmsService(WebClient.Builder webClientBuilder,
                      @Value("${africastalking.api-base:https://api.sandbox.africastalking.com}") String baseUrl) {
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
    }

    public String sendOtpSms(String phone, String otp) {
        if (phone == null || phone.isBlank()) return "empty-phone";

        // phone must be international format: +2547XXXXXXXX
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("username", atUsername);
        form.add("to", phone);
        form.add("message", "Your OTP code is: " + otp);

        return webClient.post()
                // explicit relative path on the baseUrl
                .uri("/version1/messaging")
                // Africa's Talking expects the apiKey header named exactly "apiKey"
                .header("apiKey", atApiKey)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(form))
                .retrieve()
                .bodyToMono(String.class)
                // block for now so you can see errors synchronously in logs
                .block();
    }
}
