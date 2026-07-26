package com.assessment.auth.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import com.assessment.exception.DuplicateUserException;
import com.assessment.auth.dto.LoginDTO;
import com.assessment.auth.dto.RegistrationDTO;
import com.assessment.auth.entity.Role;
import com.assessment.auth.entity.User;
import com.assessment.auth.service.UserService;
import com.assessment.exception.InvalidPasswordException;
import com.assessment.exception.UserNotFoundException;

import jakarta.validation.Valid;

@Controller
public class AuthenticationController {

    private final UserService userService;

    public AuthenticationController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/test")
    @ResponseBody
    public String test() {
        return "Controller is working";
    }

    // Home page
    @GetMapping("/")
    public String home() {
        return "home";
    }

    // Success page
    @GetMapping("/success")
    public String success() {
        return "success";
    }

    // Show registration page
    @GetMapping("/register")
    public String showRegisterPage(Model model) {

        model.addAttribute("registrationDTO", new RegistrationDTO());
        model.addAttribute("roles", Role.values());

        return "register";
    }

    // Process registration
    @PostMapping("/register")
    public String registerUser(
            @Valid @ModelAttribute("registrationDTO") RegistrationDTO registrationDTO,
            BindingResult bindingResult,
            Model model) {

        // Validation check
        if (bindingResult.hasErrors()) {

            model.addAttribute("roles", Role.values());

            return "register";
        }

        try {

            // Save user
            userService.registerUser(registrationDTO);


            // Registration success

            model.addAttribute(
                    "registrationSuccess",
                    "Registration successful! Please login."
            );

            model.addAttribute(
                    "loginDTO",
                    new LoginDTO()
            );

            return "login";

        } catch (DuplicateUserException e) {
            // Duplicate email error
            model.addAttribute(
                    "duplicateEmailError",
                    e.getMessage()
            );

            model.addAttribute(
                    "roles",
                    Role.values()
            );

            return "register";
        }
    }

    // Show login page
    @GetMapping("/login")
    public String showLoginPage(Model model) {

        model.addAttribute(
                "loginDTO",
                new LoginDTO()
        );

        return "login";
    }
    
}
