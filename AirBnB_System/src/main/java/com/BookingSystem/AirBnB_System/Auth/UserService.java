package com.BookingSystem.AirBnB_System.Auth;

import com.BookingSystem.AirBnB_System.Auth.service.SmsService;
import com.BookingSystem.AirBnB_System.OtpUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.BookingSystem.AirBnB_System.Auth.service.EmailService;

@Service
public class UserService {
    private final UserRepository repo;
    private final BCryptPasswordEncoder encoder;
    private final String uploadDir;
    private final EmailService emailService;
    private final SmsService smsService;

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

    public UserService(UserRepository repo, BCryptPasswordEncoder encoder, @Value("${app.upload.dir}") String uploadDir, EmailService emailService, SmsService smsService) {
        this.repo = repo;
        this.encoder = encoder;
        this.uploadDir = uploadDir;
        this.emailService = emailService;
        this.smsService = smsService;
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
                .active(true)
                .build();
        return repo.save(user);
    }

//    public void updateProfile(UUID userId, String firstName, String lastName, String phone, MultipartFile photo) throws IOException {
//        User u = repo.findById(userId).orElseThrow();
//        if (firstName != null) u.setFirstName(firstName);
//        if (lastName != null) u.setLastName(lastName);
//        if (phone != null) u.setPhoneNumber(phone);
//        if (photo != null && !photo.isEmpty()) {
//            String filename = userId + "_" + photo.getOriginalFilename();
//            Path dest = Path.of(uploadDir, filename);
//            try (InputStream in = photo.getInputStream()) {
//                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
//            }
//            u.setProfilePhotoPath(dest.toString());
//        }
//        repo.save(u);
//    }
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
                .passwordHash("")
                .role(Role.GUEST)
                .active(true)
                .build();

        return repo.save(newUser);
    }
    public List<UserDTO>getAllUsers(){
        return repo.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }
    public void save(User user){
        repo.save(user);
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
    @Transactional
    public UserDTO createAdminWithOtp(UUID requestedByAdminId, String firstName, String lastName, String email, String rawPassword, String phoneNumber){
        User requester = repo.findById(requestedByAdminId).orElseThrow(()-> new RuntimeException("Admin not found"));
        if(repo.existsByEmail(email))
            throw new IllegalArgumentException("Email already exists!");

        String tempPassword = UUID.randomUUID().toString();
        String encodedTempPassword = encoder.encode(tempPassword);
        User admin = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phoneNumber(phoneNumber)
                .role(Role.ADMIN)
                .active(true)
                .passwordHash(encodedTempPassword)
                .build();
        repo.save(admin);
        return mapToDTO(admin);
    }

    public User findEntityByEmail(String email) {
        return repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
    @Transactional
    public UserDTO createAdmin(UUID requestedByAdminId,String firstName, String lastName, String email, String rawPassword, String phoneNumber){
        User requester = repo.findById(requestedByAdminId).orElseThrow(()-> new RuntimeException("Admin not found!"));
        if (repo.existsByEmail(email)){
            throw new IllegalArgumentException("Email already exists!");
        };
        String otp = OtpUtil.generateOtp();
        String tempPassword = UUID.randomUUID().toString();
        String encodedTempPassword = encoder.encode(tempPassword);
        User admin = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phoneNumber(phoneNumber)
                .role(Role.ADMIN)
                .active(false)
                .otpVerified(false)
                .otpCode(otp)
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .passwordHash(encodedTempPassword)
                .build();
        repo.save(admin);
        try{
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            System.err.println("Email send failed: " + e.getMessage());
        }
        try {
            smsService.sendOtpSms(phoneNumber, otp);
        } catch (Exception e) {
            System.err.println("SMS send failed: " + e.getMessage());
        }
    return mapToDTO(admin);
    }
    public UserDTO getProfile(String email){
        User user = repo.findByEmail(email).orElseThrow(()-> new RuntimeException("User not found"));
        return mapToDTO(user);
    }
    @Transactional
    public UserDTO updateProfile(
            String email,
            UpdateProfileRequest req,
            MultipartFile photo
    )throws IOException{
        User user = repo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found!"));
        if (req != null){
            if (req.getFirstName()!= null) user.setFirstName(req.getFirstName());
            if(req.getLastName()!= null) user.setLastName(req.getLastName());
            if(req.getPhoneNumber()!= null) user.setPhoneNumber(req.getPhoneNumber());
            if(req.getPassword()!=null) user.setPasswordHash(req.getPassword());
            if(req.getEmail()!= null)user.setEmail(req.getEmail());
        }
        if(photo != null && !photo.isEmpty()){
            String filename = user.getUserId() + "_" + photo.getOriginalFilename();
            Path dest = Path.of(uploadDir, filename);
            Files.copy(photo.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
            user.setProfilePhotoPath("/uploads/" + filename);
        }
        repo.save(user);
        return mapToDTO(user);
    }

    // other methods: findByEmail, findById etc.
}

