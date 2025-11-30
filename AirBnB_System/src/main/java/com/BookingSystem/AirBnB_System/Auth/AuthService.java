package com.BookingSystem.AirBnB_System.Auth;


import com.BookingSystem.AirBnB_System.Auth.security.JwtUtil;
import org.springframework.security.authentication.*;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import java.util.Optional;

import java.util.UUID;

@Service
public class AuthService {
    private final AuthenticationManager authManager;
    private final UserRepository repo;
    private final JwtUtil jwtUtil;

    public AuthService(AuthenticationManager am, UserRepository repo, JwtUtil jwtUtil) {
        this.authManager = am;
        this.repo = repo;
        this.jwtUtil = jwtUtil;
    }

    public String login(String email, String password) {
        Authentication auth = authManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        // load user
        User u = repo.findByEmail(email).orElseThrow();
        return jwtUtil.generateToken(u.getUserId(), u.getEmail(), u.getRole().name());
    }


}

