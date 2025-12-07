package com.BookingSystem.AirBnB_System.Auth.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            String html = "<h2>AirBnB Admin Verification</h2>" +
                    "<p>Your OTP code is:</p>" +
                    "<h1 style='letter-spacing: 5px;'>" + otp + "</h1>" +
                    "<p>This code expires in <b>10 minutes</b>.</p>";

            helper.setFrom("AirBnB System <yourgmail@gmail.com>");
            helper.setTo(to);
            helper.setSubject("Your OTP Verification Code");
            helper.setText(html, true);

            mailSender.send(message);
            System.out.println("OTP email sent to: " + to);

        } catch (MessagingException e) {
            System.err.println("Email send failed: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }
}
