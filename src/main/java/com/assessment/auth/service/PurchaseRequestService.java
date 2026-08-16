package com.assessment.auth.service;

import com.assessment.auth.dto.ApprovalDTO;
import com.assessment.auth.dto.PurchaseRequestDTO;
import com.assessment.auth.entity.*;
import com.assessment.auth.repository.PurchaseRequestItemRepository;
import com.assessment.auth.repository.PurchaseRequestRepository;
import com.assessment.auth.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestItemRepository purchaseRequestItemRepository;
    private final UserRepository userRepository;

    public PurchaseRequestService(
            PurchaseRequestRepository purchaseRequestRepository,
            PurchaseRequestItemRepository purchaseRequestItemRepository,
            UserRepository userRepository) {

        this.purchaseRequestRepository = purchaseRequestRepository;
        this.purchaseRequestItemRepository = purchaseRequestItemRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE PURCHASE REQUEST
    // =========================================================
    @Transactional
    public PurchaseRequest createRequest(
            Long employeeId,
            PurchaseRequestDTO dto) {

        User employee = userRepository.findById(employeeId)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        long activeCount =
                purchaseRequestRepository.countByEmployeeIdAndStatusIn(
                        employeeId,
                        List.of(
                                Status.PENDING_MANAGER,
                                Status.PENDING_PROCUREMENT,
                                Status.PROCUREMENT_IN_PROGRESS
                        )
                );

        if (activeCount >= 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You already have 2 pending purchase requests. "
                    + "Please wait until one request is approved, "
                    + "rejected, or completed before submitting a new request."
            );
        }

        // =====================================================
        // PARENT PURCHASE REQUEST
        // =====================================================

        PurchaseRequest request = new PurchaseRequest();

        request.setEmployee(employee);

        request.setRequestedBy(
                employee.getName()
        );

        request.setRequestedItem(
                dto.getTitle()
        );

        request.setTitle(
                dto.getTitle()
        );

        request.setDescription(
                dto.getDescription()
        );

        request.setQuantity(
                dto.getQuantity()
        );

        request.setAmount(
                dto.getAmount()
        );

        request.setCategory(
                dto.getCategory()
        );

        if (dto.getPriority() != null
                && !dto.getPriority().isBlank()) {

            request.setPriority(
                    Priority.valueOf(
                            dto.getPriority().toUpperCase()
                    )
            );
        } else {
              request.setPriority(Priority.MEDIUM);
        }

        request.setStatus(
                Status.PENDING_MANAGER
        );

        request.setCurrentLevel(
                "MANAGER"
        );

        // First save parent
        PurchaseRequest savedRequest =
                purchaseRequestRepository.save(request);

        // =====================================================
        // CHILD PURCHASE REQUEST ITEM
        // =====================================================

        PurchaseRequestItem item =
                new PurchaseRequestItem();

        item.setPurchaseRequest(savedRequest);

        item.setItemName(
                dto.getTitle()
        );

        item.setQuantity(
                dto.getQuantity()
        );

        /*
         * Current DTO has amount but no unitPrice.
         * Therefore we calculate unit price when possible.
         */
        if (dto.getAmount() != null
                && dto.getQuantity() != null
                && dto.getQuantity() > 0) {

            item.setUnitPrice(
                    dto.getAmount() / dto.getQuantity()
            );

        } else {
            item.setUnitPrice(0.0);
        }

        item.setAmount(
                dto.getAmount()
        );

        purchaseRequestItemRepository.save(item);

        return savedRequest;
    }


    // =========================================================
    // MANAGER APPROVAL
    // =========================================================
    public PurchaseRequest approveRequest(
            Long requestId,
            ApprovalDTO dto) {

        PurchaseRequest request =
                purchaseRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );

        if (dto.isApproved()) {

            request.setStatus(
                    Status.PENDING_PROCUREMENT
            );

            request.setCurrentLevel(
                    "PROCUREMENT"
            );

        } else {

            request.setStatus(
                    Status.REJECTED
            );

            request.setCurrentLevel(
                    "REJECTED"
            );
        }

        request.setRemarks(
                dto.getRemarks()
        );

        request.setApprovalDate(
                LocalDateTime.now()
        );

        request.setExpiryDate(
                LocalDateTime.now().plusDays(15)
        );

        return purchaseRequestRepository.save(request);
    }


    // =========================================================
    // EMPLOYEE DASHBOARD
    // =========================================================
    public List<PurchaseRequest> getEmployeeRequests(
            Long employeeId) {

        User employee =
                userRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );

        return purchaseRequestRepository.findByEmployee(
                employee
        );
    }


    // =========================================================
    // MANAGER DASHBOARD
    // =========================================================
    public List<PurchaseRequest> getPendingRequests() {

        return purchaseRequestRepository.findByStatus(
                Status.PENDING_MANAGER
        );
    }


    // =========================================================
    // PROCUREMENT DASHBOARD
    // =========================================================
    public List<PurchaseRequest> getProcurementRequests() {

        List<PurchaseRequest> pending =
                purchaseRequestRepository.findByStatus(
                        Status.PENDING_PROCUREMENT
                );

        List<PurchaseRequest> progress =
                purchaseRequestRepository.findByStatus(
                        Status.PROCUREMENT_IN_PROGRESS
                );

        List<PurchaseRequest> completed =
                purchaseRequestRepository.findByStatus(
                        Status.COMPLETED
                );

        System.out.println(
                "PENDING = " + pending.size()
        );

        System.out.println(
                "PROGRESS = " + progress.size()
        );

        System.out.println(
                "COMPLETED = " + completed.size()
        );

        List<PurchaseRequest> requests =
                new ArrayList<>();

        requests.addAll(pending);
        requests.addAll(progress);
        requests.addAll(completed);

        return requests;
    }


    // =========================================================
    // START PROCUREMENT
    // =========================================================
    public PurchaseRequest startProcurement(
            Long requestId) {

        PurchaseRequest request =
                purchaseRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"
                                )
                        );

        request.setStatus(
                Status.PROCUREMENT_IN_PROGRESS
        );

        request.setCurrentLevel(
                "PROCUREMENT"
        );

        return purchaseRequestRepository.save(request);
    }


    // =========================================================
    // COMPLETE PROCUREMENT
    // =========================================================
    public PurchaseRequest completeProcurement(
            Long requestId) {

        PurchaseRequest request =
                purchaseRequestRepository.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Request not found"
                                )
                        );

        request.setStatus(
                Status.COMPLETED
        );

        request.setCurrentLevel(
                "COMPLETED"
        );

        return purchaseRequestRepository.save(request);
    }


    // =========================================================
    // GET REQUEST BY ID
    // =========================================================
    public PurchaseRequest getRequestById(
            Long requestId) {

        return purchaseRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Purchase Request not found"
                        )
                );
    }
}