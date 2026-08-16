package com.assessment.auth.service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.assessment.auth.dto.LoginDTO;
import com.assessment.auth.dto.RegistrationDTO;
import com.assessment.auth.entity.User;
import com.assessment.auth.exception.DuplicateUserException;
import com.assessment.auth.exception.InvalidPasswordException;
import com.assessment.auth.exception.UserNotFoundException;
import com.assessment.auth.repository.UserRepository;

/**
 * UserService contains registration and login business logic.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Register a new user.
     * Returns true if registration is successful.
     * Returns false if email already exists.
     */
    public boolean registerUser(RegistrationDTO registrationDTO) {
        // Check duplicate email
        boolean emailExists = userRepository.existsByEmail(registrationDTO.getEmail());
        if(emailExists){
            throw new DuplicateUserException("Email already exists");
        }
        // Create new user object
        User user = new User();
        user.setName(registrationDTO.getName());
        user.setEmail(registrationDTO.getEmail());
        user.setRole(registrationDTO.getRole());
        user.setCreatedDate(LocalDateTime.now());

        // Encode password before saving (never store plain text password)
        String encodedPassword = passwordEncoder.encode(registrationDTO.getPassword());
        user.setPassword(encodedPassword);

        // Save user in database
        userRepository.save(user);
        return true;
    }

    /**
     * Login user using email and password.
     * Returns user object if login is successful.
     * Returns null if email or password is wrong.
     */
    public User loginUser(LoginDTO loginDTO) {

        System.out.println("Email received: " + loginDTO.getEmail());
        System.out.println("Password received: " + loginDTO.getPassword());

        User user = userRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        if (user == null) {
            throw new UserNotFoundException(
                    "User not found"
            );
        }


        boolean passwordMatches =
                passwordEncoder.matches(
                        loginDTO.getPassword(),
                        user.getPassword()
                );


        if (!passwordMatches) {
            throw new InvalidPasswordException(
                    "Invalid password"
            );
        }


        return user;
    }

    public User updateAvailability(Long userId, boolean available) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setAvailable(available);

        return userRepository.save(user);
    }
}
