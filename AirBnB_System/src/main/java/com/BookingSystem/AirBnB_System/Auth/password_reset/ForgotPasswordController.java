//package com.BookingSystem.AirBnB_System.Auth.password_reset;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//
//public class ForgotPasswordController {
//}


package com.BookingSystem.AirBnB_System.Auth.password_reset;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    public ForgotPasswordController(ForgotPasswordService forgotService) {
        this.forgotPasswordService = forgotService;
    }

    // STEP 1: SEND OTP
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        return ResponseEntity.ok(forgotPasswordService.sendOtp(req.getEmail()));
    }

    // STEP 2: VERIFY OTP
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest req) {
        return ResponseEntity.ok(forgotPasswordService.verifyOtp(req.getEmail(), req.getOtp()));
    }

    // STEP 3: RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        return ResponseEntity.ok(
                forgotPasswordService.resetPassword(req.getEmail(), req.getNewPassword(), req.getConfirmPassword())
        );
    }
}

