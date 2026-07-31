package com.assessment.auth.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.entity.Status;
import com.assessment.auth.entity.User;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {

    List<PurchaseRequest> findByStatus(Status status);

    long countByStatus(Status status);

    // Employee Dashboard
    List<PurchaseRequest> findByEmployee(User employee);

}