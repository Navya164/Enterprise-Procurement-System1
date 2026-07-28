package com.pms.validation;

import com.pms.entity.Business;

public class businessvalidator {

    // Validate Business object
    public static boolean validateBusiness(Business business) {

        if (business == null) {
            return false;
        }

        // Business name validation
        if (business.getBusinessName() == null ||
                business.getBusinessName().trim().isEmpty()) {
            return false;
        }

        // Email validation
        if (business.getEmail() == null ||
                !business.getEmail().contains("@")) {
            return false;
        }

        // Phone number validation
        if (business.getPhoneNumber() == null ||
                business.getPhoneNumber().length() != 10) {
            return false;
        }

        // Address validation
        if (business.getAddress() == null ||
                business.getAddress().trim().isEmpty()) {
            return false;
        }

        return true;
    }

    // Validate Business Name only
    public static boolean validateBusinessName(String businessName) {

        return businessName != null &&
                !businessName.trim().isEmpty();
    }

    // Validate Email
    public static boolean validateEmail(String email) {

        return email != null &&
                email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");
    }

    // Validate Phone Number
    public static boolean validatePhone(String phone) {

        return phone != null &&
                phone.matches("\\d{10}");
    }
}