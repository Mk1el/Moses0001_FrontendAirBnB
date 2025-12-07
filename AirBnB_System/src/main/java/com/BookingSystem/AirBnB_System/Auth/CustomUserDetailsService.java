package com.BookingSystem.AirBnB_System.Auth;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository repo;

    public CustomUserDetailsService(UserRepository repo) {
        this.repo = repo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var user = repo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));

        // LOGGING
        System.out.println("[CustomUserDetailsService] Loading user: " + email);
        System.out.println("[CustomUserDetailsService] Role: " + user.getRole());
        System.out.println("[CustomUserDetailsService] Granted Authorities: " + authorities);


        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                authorities
        );
    }
}
