package com.assessment.auth.repository;

import com.assessment.auth.entity.WorkflowLog;
import com.assessment.auth.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowLogRepository extends JpaRepository<WorkflowLog, Long> {

    List<WorkflowLog> findByPurchaseRequest(PurchaseRequest purchaseRequest);

}