package com.assessment.auth.dto;

import com.assessment.auth.entity.Role;
import com.assessment.auth.validation.ValidPassword;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * RegistrationDTO holds registration form data from the user.
 * Validation annotations check input before saving to database.
 */
public class RegistrationDTO {

    @NotBlank(message = "Full name cannot be empty")
    private String name;

    @NotBlank(message = "Email cannot be empty")
    @Email(message = "Please enter a valid email address")
    private String email;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 8, message = "Password must be at least 8 characters")
    @ValidPassword
    private String password;

    @NotNull(message = "Please select a role")
    private Role role;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
