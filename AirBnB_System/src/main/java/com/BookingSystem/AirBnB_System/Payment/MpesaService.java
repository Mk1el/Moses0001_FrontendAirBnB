package com.BookingSystem.AirBnB_System.Payment;

import com.BookingSystem.AirBnB_System.Booking.Booking;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class MpesaService {

    @Value("${mpesa.consumer-key}")
    private String consumerKey;

    @Value("${mpesa.consumer-secret}")
    private String consumerSecret;

    @Value("${mpesa.shortcode}")
    private String shortcode;

    @Value("${mpesa.passkey}")
    private String passkey;

    @Value("${mpesa.stk-push-url}")
    private String stkPushUrl;

    @Value("${mpesa.oauth-url}")
    private String oauthUrl;

    private final RestTemplate rest = new RestTemplate();

    @Data
    public static class StkResponse {
        private String CheckoutRequestID;
        private String ResponseCode;
        private String ResponseDescription;
    }

    public StkResponse stkPush(Booking booking, BigDecimal amount, String phoneNumber, String paymentId) {
        String token = fetchOauthToken();

        // LOG 1: Confirms successful token acquisition
        log.info("Mpesa Token obtained: {}", token);

        String timestamp = java.time.format.DateTimeFormatter
                .ofPattern("yyyyMMddHHmmss")
                .withZone(java.time.ZoneId.of("Africa/Nairobi"))
                .format(Instant.now());

        String rawPassword = shortcode + passkey + timestamp;
        String password = Base64.getEncoder()
                .encodeToString(rawPassword.getBytes(StandardCharsets.UTF_8));

        // LOG 2 & 3: Confirms Shortcode/Passkey/Timestamp are correctly concatenated and encoded
        log.info("STK Push Raw Password: {}", rawPassword);
        log.info("STK Push Encoded Password: {}", password);

        Map<String, Object> body = new HashMap<>();
        body.put("BusinessShortCode", shortcode);
        body.put("Password", password);
        body.put("Timestamp", timestamp);
        body.put("TransactionType", "CustomerPayBillOnline");
        body.put("Amount", amount.toPlainString());
        body.put("PartyA", phoneNumber);
        body.put("PartyB", shortcode);
        body.put("PhoneNumber", phoneNumber);
        body.put("CallBackURL", "https://abcdef.ngrok-free.app/api/payments/webhook/mpesa"); // Assuming ngrok URL is valid
        body.put("AccountReference", "Booking-" + booking.getBookingId());
        body.put("TransactionDesc", "Payment for booking " + booking.getBookingId());

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // LOG 4: Confirms all headers sent with the STK Push request
        log.info("STK Push Request Headers: {}", headers.toString());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        // LOG 5: Confirms the final JSON body sent for the STK Push request
        log.info("STK Push Request Body: {}", request.getBody());

        try {
            ResponseEntity<StkResponse> response = rest.postForEntity(stkPushUrl, request, StkResponse.class);
            // LOG 6: Logs success response
            log.info("STK Push Success Response: {}", response.getBody());

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            } else {
                // Fallback to throw a more descriptive error if status code isn't 2xx but something unexpected
                throw new RuntimeException("Mpesa STK push failed with status: " + response.getStatusCodeValue());
            }
        } catch (HttpClientErrorException e) {
            // This is the error handler for 4xx and 5xx errors (where the API gives a JSON body)
            String errorBody = e.getResponseBodyAsString();
            log.error("STK Push Error: {} - Response Body: {}", e.getStatusCode(), errorBody);
            throw new RuntimeException("Mpesa STK push failed: " + e.getStatusCode() + " - " + errorBody, e);
        } catch (Exception e) {
            // Logs General Exceptions (e.g., connection timeout)
            log.error("STK Push General Exception: {}", e.getMessage(), e);
            throw new RuntimeException("Mpesa STK push failed: " + e.getMessage(), e);
        }
    }

    private String fetchOauthToken() {
        try {
            String credentials = consumerKey + ":" + consumerSecret;
            String encodedCredentials = Base64.getEncoder()
                    .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));

            // LOG 7: Confirms the encoded credentials sent for OAuth
            log.info("OAuth Basic Auth Credentials: {}", encodedCredentials);

            HttpHeaders headers = new HttpHeaders();
            headers.add("Authorization", "Basic " + encodedCredentials);

            // LOG 8: Confirms the headers sent for OAuth
            log.info("OAuth Request Headers: {}", headers.toString());

            HttpEntity<String> request = new HttpEntity<>(headers);

            ResponseEntity<Map> response = rest.exchange(
                    oauthUrl,
                    HttpMethod.GET,
                    request,
                    Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String token = (String) response.getBody().get("access_token");
                if (token == null) {
                    throw new RuntimeException("OAuth token response was successful but access_token is missing.");
                }
                // LOG 9: Logs success (token value is returned)
                return token;
            } else {
                // LOG 10: Logs non-OK status codes for OAuth
                throw new RuntimeException("Failed to get access token: " + response.getStatusCodeValue() + " - " + response.getBody());
            }
        } catch (HttpClientErrorException e) {
            String errorBody = e.getResponseBodyAsString();
            // LOG 11: Logs 4xx/5xx errors for OAuth
            log.error("OAuth Token Error: {} - Response Body: {}", e.getStatusCode(), errorBody);
            throw new RuntimeException("Error fetching OAuth token: " + e.getStatusCode() + " - " + errorBody, e);
        } catch (Exception e) {
            // LOG 12: Logs General Exceptions for OAuth
            log.error("OAuth Token General Exception: {}", e.getMessage(), e);
            throw new RuntimeException("Error fetching OAuth token: " + e.getMessage(), e);
        }
    }
}