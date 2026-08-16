package com.assessment.auth.service;

import org.springframework.stereotype.Service;

import com.assessment.auth.dto.DashboardDTO;
import com.assessment.auth.entity.Status;
import com.assessment.auth.repository.PurchaseRequestRepository;
import com.assessment.auth.repository.UserRepository;
import com.pms.entity.PurchaseOrderStatus;
import com.pms.repository.PurchaseOrderRepository;

import java.util.List;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;

    public DashboardService(UserRepository userRepository,
                            PurchaseRequestRepository purchaseRequestRepository,
                            PurchaseOrderRepository purchaseOrderRepository) {

        this.userRepository = userRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public DashboardDTO getDashboardData() {

        DashboardDTO dto = new DashboardDTO();

        // ============ Existing Purchase Request summary ============

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

        // ============ NEW: Purchase Order summary (Task 1) ============

        dto.setTotalPOs(
                purchaseOrderRepository.countAllPurchaseOrders());

        dto.setPoPending(
                purchaseOrderRepository.countByStatusIn(
                        List.of(PurchaseOrderStatus.CREATED)
                ));

        dto.setPoInProgress(
                purchaseOrderRepository.countByStatusIn(
                        List.of(
                                PurchaseOrderStatus.SENT,
                                PurchaseOrderStatus.ACCEPTED,
                                PurchaseOrderStatus.SHIPPED,
                                PurchaseOrderStatus.PARTIALLY_DELIVERED
                        )
                ));

        dto.setPoCompleted(
                purchaseOrderRepository.countByStatusIn(
                        List.of(
                                PurchaseOrderStatus.DELIVERED,
                                PurchaseOrderStatus.CLOSED
                        )
                ));

        dto.setPoRejected(
                purchaseOrderRepository.countByStatusIn(
                        List.of(
                                PurchaseOrderStatus.REJECTED,
                                PurchaseOrderStatus.CANCELLED
                        )
                ));

        dto.setTotalVendors(
                purchaseOrderRepository.countDistinctVendors());

        return dto;
    }
}