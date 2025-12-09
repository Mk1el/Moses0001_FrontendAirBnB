package com.BookingSystem.AirBnB_System.Auth.password_reset;

import com.BookingSystem.AirBnB_System.Auth.User;
import com.BookingSystem.AirBnB_System.Auth.UserRepository;
import com.BookingSystem.AirBnB_System.Auth.service.EmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class ForgotPasswordService {
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public ForgotPasswordService(UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }
    public String sendOtp(String email){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not found!"));
        String otp = String.format("%6d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);
        emailService.sendOtp(email, otp);
        return "OTP sent successfully to email!";
    }
    public String verifyOtp(String email, String otp){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email not found!"));
        if(user.getOtpCode() == null || user.getOtpExpiry()==null)
            throw new RuntimeException("OTP not generated!");
        if (!user.getOtpCode().equals(otp))
            throw new RuntimeException("Invalid OTP!");
        if (user.getOtpExpiry().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired!");

        return "OTP verified successfully!";
    }
    // Reset Password
    public String resetPassword(String email,String newPassword, String confirmPassword){
        if(!newPassword.equals(confirmPassword)){
            throw new RuntimeException("Password do not match!");
        }
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("Email not found!"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        return "Password reset successfully!";
    }
}
