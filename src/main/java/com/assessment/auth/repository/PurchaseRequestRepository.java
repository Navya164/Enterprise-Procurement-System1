package com.assessment.auth.repository;

import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {

    /**
     * Get all requests by status.
     */
    List<PurchaseRequest> findByStatus(Status status);

}