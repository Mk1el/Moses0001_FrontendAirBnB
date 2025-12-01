package com.BookingSystem.AirBnB_System.Auth;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final String uploadDir;

    private UserDTO mapToDTO(User user){
        return new UserDTO(
                user.getUserId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getProfilePhotoPath(),
                user.getCreatedAt(),
                user.isActive()
        );
    }

    public UserService(UserRepository repo, BCryptPasswordEncoder encoder, @Value("${app.upload.dir}") String uploadDir) {
        this.repo = repo;
        this.encoder = encoder;
        this.uploadDir = uploadDir;
        try { Files.createDirectories(Path.of(uploadDir)); } catch (IOException ignored) {}
    }

    public User registerGuestOrHost(String firstName, String lastName, String email, String rawPassword, String phone, Role role) {
        if (repo.existsByEmail(email)) throw new IllegalArgumentException("Email already exists");
        User user = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .passwordHash(encoder.encode(rawPassword))
                .phoneNumber(phone)
                .role(role)
                .build();
        return repo.save(user);
    }

    public void updateProfile(UUID userId, String firstName, String lastName, String phone, MultipartFile photo) throws IOException {
        User u = repo.findById(userId).orElseThrow();
        if (firstName != null) u.setFirstName(firstName);
        if (lastName != null) u.setLastName(lastName);
        if (phone != null) u.setPhoneNumber(phone);
        if (photo != null && !photo.isEmpty()) {
            String filename = userId + "_" + photo.getOriginalFilename();
            Path dest = Path.of(uploadDir, filename);
            try (InputStream in = photo.getInputStream()) {
                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            u.setProfilePhotoPath(dest.toString());
        }
        repo.save(u);
    }
    public User findOrCreateUser(String email, String name, String pictureUrl) {
        Optional<User> existingUser = repo.findByEmail(email);

        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Split name into first and last name
        String firstName = "";
        String lastName = "";

        if (name != null && name.contains(" ")) {
            int idx = name.indexOf(' ');
            firstName = name.substring(0, idx);
            lastName = name.substring(idx + 1);
        } else if (name != null) {
            firstName = name;
        }

        //  Create and save a new user
        User newUser = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .passwordHash("") // Google users don’t need a local password
                .role(Role.GUEST)
                .build();

        return repo.save(newUser);
    }
    public List<UserDTO>getAllUsers(){
        return repo.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    public long getTotalUsers(){
        return repo.count();
    }
    @Transactional
    public UserDTO activateUser(UUID userId){
        User user = repo.findById(userId).orElseThrow(()-> new RuntimeException("User not found"));
        user.setActive(true);
        return mapToDTO(user);
    }
    @Transactional
    public UserDTO deactivateUser(UUID userId){
        User user = repo.findById(userId).orElseThrow(()-> new RuntimeException("User not found"));
        user.setActive(false);
        return mapToDTO(user);
    }


    // other methods: findByEmail, findById etc.
}

