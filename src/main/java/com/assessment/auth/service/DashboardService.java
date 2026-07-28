package com.assessment.auth.service;

import org.springframework.stereotype.Service;

import com.assessment.auth.dto.DashboardDTO;
import com.assessment.auth.entity.Status;
import com.assessment.auth.repository.PurchaseRequestRepository;
import com.assessment.auth.repository.UserRepository;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;

    public DashboardService(UserRepository userRepository,
                            PurchaseRequestRepository purchaseRequestRepository) {

        this.userRepository = userRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
    }

    public DashboardDTO getDashboardData() {

        DashboardDTO dto = new DashboardDTO();

        dto.setTotalUsers(userRepository.count());

        dto.setTotalRequests(purchaseRequestRepository.count());

        dto.setPendingManager(
                purchaseRequestRepository.countByStatus(Status.PENDING_MANAGER));

        dto.setPendingProcurement(
                purchaseRequestRepository.countByStatus(Status.PENDING_PROCUREMENT));

        dto.setProcurementInProgress(
                purchaseRequestRepository.countByStatus(Status.PROCUREMENT_IN_PROGRESS));

        dto.setCompleted(
                purchaseRequestRepository.countByStatus(Status.COMPLETED));

        dto.setRejected(
                purchaseRequestRepository.countByStatus(Status.REJECTED));

        return dto;
    }
}