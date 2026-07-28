package com.assessment.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.assessment.auth.dto.LoginDTO;
import com.assessment.auth.dto.RegistrationDTO;
import com.assessment.auth.entity.User;
import com.assessment.auth.exception.DuplicateUserException;
import com.assessment.auth.service.UserService;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthenticationController {


    private final UserService userService;


    public AuthenticationController(UserService userService) {
        this.userService = userService;
    }


    // Test API
    @GetMapping("/test")
    public String test() {

        return "Authentication API Working";

    }



    // REGISTER USER
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegistrationDTO registrationDTO) {


        try {

            userService.registerUser(registrationDTO);


            return ResponseEntity.ok(
                    "Registration Successful"
            );


        }
        catch(DuplicateUserException e) {


            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }

    }



    // LOGIN USER
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginDTO loginDTO) {


        try {


            User user =
                    userService.loginUser(loginDTO);


            return ResponseEntity.ok(user);


        }
        catch(Exception e) {


            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());

        }

    }

}