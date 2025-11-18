package com.BookingSystem.AirBnB_System.Payment;

import com.BookingSystem.AirBnB_System.Booking.Booking;
import lombok.Data;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class PaypalService {

    private static final Logger log = LoggerFactory.getLogger(PaypalService.class);

    @Value("${paypal.client-id}") private String clientId;
    @Value("${paypal.client-secret}") private String clientSecret;
    @Value("${paypal.base-url:https://api.sandbox.paypal.com}") private String baseUrl;

    // fallback rates
    @Value("${fx.fallback.kes-usd:0.00774}") private BigDecimal fallbackKesUsd;
    @Value("${fx.fallback.eur-usd:1.08}") private BigDecimal fallbackEurUsd;
    @Value("${fx.fallback.gbp-usd:1.27}") private BigDecimal fallbackGbpUsd;

    @Value("${fx.provider.convert:https://api.exchangerate.host/convert}")
    private String fxEndpoint;

    private final RestTemplate rest = new RestTemplate();

    @Data
    public static class PaypalOrder {
        private String orderId;
        private String approvalUrl;
    }

    /**
     * Creates a PayPal order, always converting any currency → USD first.
     */
    public PaypalOrder createOrder(Booking booking, BigDecimal amount, String returnUrl, String cancelUrl, String paymentId) {

        String token = fetchAccessToken();

        // default currency is KES
        String currency = "KES";
        try {
            if (booking != null && booking.getProperty() != null) {
                String maybe = booking.getProperty().getCurrency();
                if (StringUtils.hasText(maybe) && maybe.trim().length() == 3) {
                    currency = maybe.trim().toUpperCase(Locale.ROOT);
                }
            }
        } catch (Exception ex) {
            log.warn("Could not read booking currency. Defaulting to KES.");
        }

        // ALWAYS convert → USD for PayPal
        BigDecimal amountUsd = convertCurrency(currency, "USD", amount);

        DecimalFormat df = new DecimalFormat("0.00");
        df.setRoundingMode(RoundingMode.HALF_UP);
        String usdValue = df.format(amountUsd);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        Map<String, Object> purchaseUnit = Map.of(
                "amount", Map.of(
                        "currency_code", "USD",
                        "value", usdValue
                ),
                "reference_id", paymentId
        );

        Map<String, Object> body = Map.of(
                "intent", "CAPTURE",
                "application_context", Map.of(
                        "return_url", returnUrl,
                        "cancel_url", cancelUrl
                ),
                "purchase_units", List.of(purchaseUnit)
        );

        HttpEntity<Map<String, Object>> req = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> resp = rest.postForEntity(baseUrl + "/v2/checkout/orders", req, Map.class);

            if (!resp.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("PayPal order creation failed: " + resp.getStatusCodeValue());
            }

            Map<String, Object> respBody = resp.getBody();
            String orderId = (String) respBody.get("id");

            List<Map<String, String>> links = (List<Map<String, String>>) respBody.get("links");
            String approvalUrl = links.stream()
                    .filter(l -> "approve".equalsIgnoreCase(l.get("rel")))
                    .map(l -> l.get("href"))
                    .findFirst()
                    .orElse(null);

            PaypalOrder out = new PaypalOrder();
            out.setOrderId(orderId);
            out.setApprovalUrl(approvalUrl);
            return out;

        } catch (HttpClientErrorException he) {
            log.error("PayPal order error: Status={}, body={}", he.getStatusCode(), he.getResponseBodyAsString());
            throw new RuntimeException("PayPal order failed: " + he.getStatusCode(), he);

        } catch (Exception ex) {
            log.error("Unexpected PayPal error", ex);
            throw new RuntimeException("PayPal order failed", ex);
        }
    }

    /**
     * Converts ANY currency → ANY currency using exchangerate.host.
     * Falls back to internal static rates if API call fails.
     */
    public BigDecimal convertCurrency(String from, String to, BigDecimal amount) {

        try {
            String url = fxEndpoint +
                    "?from=" + from +
                    "&to=" + to +
                    "&amount=" + amount.toPlainString();

            ResponseEntity<Map> resp = rest.getForEntity(url, Map.class);

            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Object result = resp.getBody().get("result");

                if (result != null) {
                    BigDecimal out = new BigDecimal(result.toString());
                    return out.setScale(2, RoundingMode.HALF_UP);
                }
            }

            log.warn("FX provider gave no result. Falling back. {} → {}", from, to);

        } catch (Exception ex) {
            log.warn("FX API failed for {} → {}. Using fallback rate.", from, to, ex);
        }

        // fallback conversion
        BigDecimal rate = getFallbackRate(from, to);
        return amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Local fallback rates in case internet is down.
     */
    private BigDecimal getFallbackRate(String from, String to) {
        if (from.equals("KES") && to.equals("USD")) return fallbackKesUsd;
        if (from.equals("EUR") && to.equals("USD")) return fallbackEurUsd;
        if (from.equals("GBP") && to.equals("USD")) return fallbackGbpUsd;

        log.warn("No fallback rate for {} → {}. Using neutral 1:1 rate.", from, to);
        return BigDecimal.ONE;
    }

    /**
     * Fetch PayPal OAuth2 token.
     */
    private String fetchAccessToken() {

        String url = baseUrl + "/v1/oauth2/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setBasicAuth(clientId, clientSecret);
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<String> req = new HttpEntity<>("grant_type=client_credentials", headers);

        try {
            ResponseEntity<Map> resp = rest.postForEntity(url, req, Map.class);

            Object token = resp.getBody().get("access_token");
            if (token == null) throw new RuntimeException("PayPal access token missing");

            return token.toString();

        } catch (Exception ex) {
            log.error("PayPal token fetch failed", ex);
            throw new RuntimeException("Failed to retrieve PayPal token", ex);
        }
    }
}
