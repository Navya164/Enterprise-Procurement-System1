package com.assessment.auth.validation;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

/**
 * Custom annotation to validate password rules.
 * Used on RegistrationDTO password field.
 */
@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default "Password must be at least 8 characters with uppercase, lowercase, digit and special character";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
