package com.BookingSystem.AirBnB_System.Auth;

import com.BookingSystem.AirBnB_System.Auth.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory; // ✅ This one was missing
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;
    private final UserRepository repo;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, AuthService authService, UserRepository repo, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authService = authService;
        this.repo = repo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest body) {

        Role role = body.getRole() != null ? body.getRole() : Role.GUEST;

        User user = userService.registerGuestOrHost(
                body.getFirstName(),
                body.getLastName(),
                body.getEmail(),
                body.getPassword(),
                body.getPhoneNumber(),
                role
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RegisterResponse(
                        user.getUserId(),
                        user.getEmail(),
                        user.getRole().name()
                ));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest body) {

        String token = authService.login(body.getEmail(), body.getPassword());

        return ResponseEntity.ok(new LoginResponse(
                token,
                "Bearer"
        ));
    }
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String idTokenString = request.get("token");

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(
                            "1054745946305-kntvibdrhnc1iann41s5094te898v8l8.apps.googleusercontent.com"
                    ))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);

            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid Google ID token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();

            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            // Create or return existing user
            User user = userService.findOrCreateUser(email, name, picture);

            // Generate your own JWT
            String jwt = jwtUtil.generateToken(
                    user.getUserId(),
                    user.getEmail(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "email", user.getEmail(),
                    "name", user.getFirstName() + " " + user.getLastName(),
                    "picture", picture
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error verifying Google token: " + e.getMessage());
        }
    }



    @GetMapping("/oath2/success")
    public ResponseEntity<LoginResponse> oauth2Success(@AuthenticationPrincipal OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");

        String first = "";
        String last = "";

        if (name != null && name.contains(" ")) {
            int idx = name.indexOf(' ');
            first = name.substring(0, idx);
            last = name.substring(idx + 1);
        } else if (name != null) {
            first = name;
        }

        final String fFirst = first;
        final String fLast = last;
        final String fEmail = email;

        User user = repo.findByEmail(email)
                .orElseGet(() -> repo.save(User.builder()
                        .firstName(fFirst)
                        .lastName(fLast)
                        .email(fEmail)
                        .passwordHash("")
                        .role(Role.GUEST)
                        .build()));

        String jwt = jwtUtil.generateToken(user.getUserId(), user.getEmail(), user.getRole().name());

        return ResponseEntity.ok(new LoginResponse(jwt, "Bearer"));
    }
}

