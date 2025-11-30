package com.BookingSystem.AirBnB_System.Payment;

import com.BookingSystem.AirBnB_System.Booking.Booking;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@Service
public class AirtelService {
    private static final Logger log = LoggerFactory.getLogger(AirtelService.class);

    private final RestTemplate rest;
    private final ObjectMapper mapper;

    @Value("${airtel.base-url:https://openapiuat.airtel.africa}")
    private String airtelBaseUrl;

    @Value("${airtel.client-id:}")
    private String clientId;

    @Value("${airtel.client-secret:}")
    private String clientSecret;

    @Value("${airtel.collection-endpoint:/collection/v1/collection/requesttopay}")
    private String collectionEndpoint;

    @Value("${airtel.currency:KES}")
    private String currency;

    // Token cache
    private static class Token {
        String accessToken;
        Instant expiry;
    }

    private final AtomicReference<Token> tokenCache = new AtomicReference<>();

    public AirtelService() {
        this.rest = new RestTemplate();
        this.mapper = new ObjectMapper();
    }

    public static class AirtelResponse {
        private String transactionId;
        private JsonNode rawResponse;

        public AirtelResponse(String id, JsonNode raw) {
            this.transactionId = id;
            this.rawResponse = raw;
        }

        public String getTransactionId() { return transactionId; }
        public JsonNode getRawResponse() { return rawResponse; }
    }

    /**
     * Request a payment via Airtel.
     *
     * @param booking   Booking object (used to build payerMessage / reference)
     * @param amount    Amount (major currency units, e.g. 100.50)
     * @param phone     MSISDN in international format (e.g. "2547XXXXXXXX")
     * @param paymentId Your internal payment id (used as external reference)
     * @return AirtelResponse containing transaction id (if any) and raw response as JsonNode
     */
    public AirtelResponse requestPayment(Booking booking, BigDecimal amount, String phone, String paymentId) {
        try {
            String token = getAccessToken();
            if (!StringUtils.hasText(token)) {
                log.error("Could not obtain Airtel access token");
                return new AirtelResponse(null, null);
            }

            String url = airtelBaseUrl + collectionEndpoint;

            // Build request body - adjust fields to match the exact Airtel country API variant
            Map<String, Object> payload = new HashMap<>();
            // Common fields many Airtel collection APIs expect - customize as necessary
            payload.put("amount", amount.toPlainString());
            payload.put("currency", currency);
            payload.put("externalId", paymentId);               // merchant reference
            Map<String, String> payer = new HashMap<>();
            payer.put("partyIdType", "MSISDN");                // or "MSISDN"
            payer.put("partyId", phone);
            payload.put("payer", payer);
            payload.put("payerMessage", "Payment for booking " + booking.getBookingId());
            payload.put("payeeNote", "Booking payment");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(token);
            headers.add("Accept", "application/json");

            HttpEntity<Map<String, Object>> req = new HttpEntity<>(payload, headers);

            log.info("Calling Airtel collection endpoint: {}", url);
            ResponseEntity<String> resp = rest.postForEntity(url, req, String.class);

            String body = resp.getBody();
            JsonNode json = null;
            if (body != null) {
                json = mapper.readTree(body);
            }
            String txId = null;
            if (json != null) {
                if (json.has("requestId")) txId = json.get("requestId").asText();
                else if (json.has("transactionId")) txId = json.get("transactionId").asText();
                else if (json.has("id")) txId = json.get("id").asText();
                else if (json.has("data") && json.get("data").has("requestId")) txId = json.get("data").get("requestId").asText();
            }

            log.info("Airtel collection response status={} txId={}", resp.getStatusCodeValue(), txId);
            return new AirtelResponse(txId, json);

        } catch (RestClientException rce) {
            log.error("HTTP error while calling Airtel API", rce);
            return new AirtelResponse(null, null);
        } catch (Exception ex) {
            log.error("Error while processing Airtel response", ex);
            return new AirtelResponse(null, null);
        }
    }

    private String getAccessToken() {
        try {
            Token t = tokenCache.get();
            if (t != null && t.accessToken != null && t.expiry != null && Instant.now().isBefore(t.expiry.minusSeconds(10))) {
                // still valid
                return t.accessToken;
            }

            String tokenUrl = airtelBaseUrl + "/auth/oauth2/token";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.add("Accept", "application/json");

            Map<String, String> body = new HashMap<>();
            body.put("client_id", clientId);
            body.put("client_secret", clientSecret);
            body.put("grant_type", "client_credentials");

            HttpEntity<Map<String, String>> req = new HttpEntity<>(body, headers);

            ResponseEntity<String> resp = rest.postForEntity(tokenUrl, req, String.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                JsonNode json = mapper.readTree(resp.getBody());
                String accessToken = json.has("access_token") ? json.get("access_token").asText() : null;
                int expiresIn = json.has("expires_in") ? json.get("expires_in").asInt() : 0;

                if (accessToken != null) {
                    Token newToken = new Token();
                    newToken.accessToken = accessToken;
                    newToken.expiry = (expiresIn > 0) ? Instant.now().plusSeconds(expiresIn) : Instant.now().plusSeconds(300);
                    tokenCache.set(newToken);
                    log.debug("Obtained Airtel access token, expires in {}s", expiresIn);
                    return accessToken;
                } else {
                    log.error("Airtel token response did not contain access_token. Body={}", resp.getBody());
                }
            } else {
                log.error("Failed to get Airtel token. status={} body={}", resp.getStatusCodeValue(), resp.getBody());
            }
        } catch (Exception ex) {
            log.error("Error retrieving Airtel token", ex);
        }
        return null;
    }
}
