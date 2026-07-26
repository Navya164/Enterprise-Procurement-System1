package com.assessment.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.assessment.auth.entity.User;

/**
 * UserRepository talks to the users table in MySQL.
 * Spring Data JPA creates the SQL queries for us.
 */
public interface UserRepository extends JpaRepository<User, Long> {

    // Find one user by email address
    User findByEmail(String email);

    // Check if email already exists in database
    boolean existsByEmail(String email);
}
