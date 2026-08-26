package com.assessment.auth.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.assessment.auth.dto.ApprovalDTO;
import com.assessment.auth.dto.PurchaseRequestDTO;
import com.assessment.auth.entity.Priority;
import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.entity.Role;
import com.assessment.auth.entity.Status;
import com.assessment.auth.entity.User;
import com.assessment.auth.repository.PurchaseRequestRepository;
import com.assessment.auth.repository.UserRepository;
import com.pms.entity.ApprovalHierarchy;
import com.pms.repository.ApprovalHierarchyRepository;

@Service
public class PurchaseRequestService {

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final UserRepository userRepository;
    private final ApprovalHierarchyRepository approvalHierarchyRepository;


    public PurchaseRequestService(
            PurchaseRequestRepository purchaseRequestRepository,
            UserRepository userRepository,
            ApprovalHierarchyRepository approvalHierarchyRepository) {

        this.purchaseRequestRepository = purchaseRequestRepository;
        this.userRepository = userRepository;
        this.approvalHierarchyRepository = approvalHierarchyRepository;
    }


    // =========================================================
    // ASSIGN MANAGER
    // =========================================================

    private void assignManager(PurchaseRequest request) {

        List<ApprovalHierarchy> hierarchy =
                approvalHierarchyRepository
                        .findAllByOrderByApprovalLevelAsc();

        for (ApprovalHierarchy level : hierarchy) {

            User manager =
                    userRepository.findById(level.getApproverId())
                            .orElse(null);

            if (manager != null
                    && manager.getRole() == Role.MANAGER) {

                request.setAssignedManager(manager);

                request.setCurrentLevel(
                        "MANAGER_LEVEL_" +
                        level.getApprovalLevel()
                );

                return;
            }
        }

        throw new RuntimeException(
                "No manager found for this request"
        );
    }


    // =========================================================
    // CHECK MANAGER AVAILABILITY
    // =========================================================

    private void reassignIfManagerUnavailable(
            PurchaseRequest request) {

        User currentManager =
                request.getAssignedManager();


        // -----------------------------------------------------
        // Manager exists and is available
        // -----------------------------------------------------

        if (currentManager != null
                && currentManager.isAvailable()) {

            request.setManagerUnavailableSince(null);

            return;
        }


        // -----------------------------------------------------
        // Manager is unavailable for first time
        // -----------------------------------------------------

        if (request.getManagerUnavailableSince() == null) {

            request.setManagerUnavailableSince(
                    LocalDateTime.now()
            );

            return;
        }


        // -----------------------------------------------------
        // Check 48-hour escalation period
        // -----------------------------------------------------

        LocalDateTime escalationTime =
                request.getManagerUnavailableSince()
                        .plusSeconds(10);


        if (LocalDateTime.now()
                .isBefore(escalationTime)) {

            return;
        }


        // -----------------------------------------------------
        // Find available senior manager
        // -----------------------------------------------------

        User seniorManager =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                user.getRole()
                                        == Role.SENIOR_MANAGER
                                && user.isAvailable()
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No available senior manager found"
                                )
                        );


        // -----------------------------------------------------
        // Escalate request
        // -----------------------------------------------------

        request.setAssignedManager(
                seniorManager
        );

        request.setCurrentLevel(
                "SENIOR_MANAGER"
        );

        request.setManagerUnavailableSince(null);
    }


    // =========================================================
    // CREATE PURCHASE REQUEST
    // =========================================================

    @Transactional
    public PurchaseRequest createRequest(
            Long employeeId,
            PurchaseRequestDTO dto) {

        User employee =
                userRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );


        // -----------------------------------------------------
        // Maximum 2 active requests
        // -----------------------------------------------------

        long activeCount =
                purchaseRequestRepository
                        .countByEmployeeIdAndStatusIn(
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
                    "You already have 2 pending purchase requests. " +
                    "Please wait until one request is approved, " +
                    "rejected, or completed before submitting a new request."
            );
        }


        // -----------------------------------------------------
        // Create purchase request
        // -----------------------------------------------------

        PurchaseRequest request =
                new PurchaseRequest();


        request.setEmployee(employee);


        // -----------------------------------------------------
        // Required database fields
        // -----------------------------------------------------

        request.setRequestedBy(
                employee.getName()
        );

        request.setRequestedItem(
                dto.getTitle()
        );


        // -----------------------------------------------------
        // Request details
        // -----------------------------------------------------

        request.setTitle(
                dto.getTitle()
        );

        request.setDescription(
                dto.getDescription()
        );

        request.setQuantity(
                dto.getQuantity()
        );

        request.setCategory(
                dto.getCategory()
        );

        request.setAmount(
                dto.getAmount()
        );


        // -----------------------------------------------------
        // Priority
        // -----------------------------------------------------

        request.setPriority(
                Priority.valueOf(
                        dto.getPriority()
                )
        );


        // -----------------------------------------------------
        // Initial status
        // -----------------------------------------------------

        request.setStatus(
                Status.PENDING_MANAGER
        );


        // -----------------------------------------------------
        // Emergency flag
        // -----------------------------------------------------

        request.setEmergencyFlag(false);


        // -----------------------------------------------------
        // Assign manager
        // -----------------------------------------------------

        assignManager(request);


        // -----------------------------------------------------
        // Check manager availability
        // -----------------------------------------------------

        if (request.getAssignedManager() == null
                || !request.getAssignedManager().isAvailable()) {

            request.setManagerUnavailableSince(
                    LocalDateTime.now()
            );
        }


        // -----------------------------------------------------
        // Save request
        // -----------------------------------------------------

        return purchaseRequestRepository.save(request);
    }


    // =========================================================
    // APPROVE / REJECT REQUEST
    // =========================================================

    @Transactional
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


        // -----------------------------------------------------
        // Check assigned manager
        // -----------------------------------------------------

        if (request.getAssignedManager() == null) {

            throw new RuntimeException(
                    "No manager is assigned to this purchase request"
            );
        }


        // -----------------------------------------------------
        // Authorization
        // -----------------------------------------------------

        if (dto.getManagerId() == null
                || !request.getAssignedManager()
                        .getId()
                        .equals(dto.getManagerId())) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to approve or reject this request"
            );
        }


        // -----------------------------------------------------
        // Save current status for undo
        // -----------------------------------------------------

        request.setPreviousStatus(
                request.getStatus().name()
        );

        request.setDecisionTime(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // APPROVE
        // -----------------------------------------------------

        if (dto.isApproved()) {

            request.setStatus(
                    Status.PENDING_PROCUREMENT
            );

            request.setCurrentLevel(
                    "PROCUREMENT"
            );
        }


        // -----------------------------------------------------
        // REJECT
        // -----------------------------------------------------

        else {

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

    @Transactional(readOnly = true)
    public List<PurchaseRequest> getEmployeeRequests(
            Long employeeId) {

        User employee =
                userRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );


        return purchaseRequestRepository
                .findByEmployee(employee);
    }


    // =========================================================
    // MANAGER DASHBOARD
    // =========================================================

    @Transactional
    public List<PurchaseRequest> getPendingRequests(
            Long managerId) {

        User manager =
                userRepository.findById(managerId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Manager not found"
                                )
                        );


        // -----------------------------------------------------
        // Check role
        // -----------------------------------------------------

        if (manager.getRole() != Role.MANAGER
                && manager.getRole() != Role.SENIOR_MANAGER) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User is not authorized to view manager requests"
            );
        }


        // -----------------------------------------------------
        // Get requests assigned to this manager
        // -----------------------------------------------------

        List<PurchaseRequest> requests =
                purchaseRequestRepository
                        .findByAssignedManagerAndStatus(
                                manager,
                                Status.PENDING_MANAGER
                        );


        // -----------------------------------------------------
        // Check availability
        // -----------------------------------------------------

        if (manager.getRole() == Role.MANAGER) {

            for (PurchaseRequest request : requests) {

                reassignIfManagerUnavailable(
                        request
                );
            }
        }


        return purchaseRequestRepository
                .saveAll(requests);
    }


    // =========================================================
    // PROCUREMENT DASHBOARD
    // =========================================================

    @Transactional(readOnly = true)
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


        completed.forEach(request ->
                System.out.println(
                        "Completed ID = "
                        + request.getRequestId()
                )
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

    @Transactional
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

    @Transactional
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
    // WORKFLOW TRACKER
    // =========================================================

    @Transactional(readOnly = true)
    public PurchaseRequest getRequestById(
            Long requestId) {

        return purchaseRequestRepository
                .findById(requestId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Purchase Request not found"
                        )
                );
    }


    // =========================================================
    // UNDO MANAGER DECISION
    // =========================================================

    @Transactional
    public PurchaseRequest undoDecision(
            Long requestId,
            Long managerId) {

        PurchaseRequest request =
                purchaseRequestRepository
                        .findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Purchase Request not found"
                                )
                        );


        // -----------------------------------------------------
        // Verify assigned manager
        // -----------------------------------------------------

        if (request.getAssignedManager() == null
                || !request.getAssignedManager()
                        .getId()
                        .equals(managerId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to undo this decision"
            );
        }


        // -----------------------------------------------------
        // Check decision exists
        // -----------------------------------------------------

        if (request.getDecisionTime() == null
                || request.getPreviousStatus() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No recent decision is available to undo"
            );
        }


        // -----------------------------------------------------
        // Check 3-minute window
        // -----------------------------------------------------

        LocalDateTime now =
                LocalDateTime.now();


        if (now.isAfter(
                request.getDecisionTime()
                        .plusMinutes(3))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Undo period has expired. The decision is now permanent."
            );
        }


        // -----------------------------------------------------
        // Restore previous status
        // -----------------------------------------------------

        Status previousStatus =
                Status.valueOf(
                        request.getPreviousStatus()
                );


        request.setStatus(
                previousStatus
        );


        // -----------------------------------------------------
        // Restore manager level
        // -----------------------------------------------------

        if (previousStatus == Status.PENDING_MANAGER) {

            request.setCurrentLevel(
                    request.getAssignedManager() != null
                            ? "MANAGER_LEVEL"
                            : "MANAGER"
            );
        }


        // -----------------------------------------------------
        // Clear undo information
        // -----------------------------------------------------

        request.setPreviousStatus(null);
        request.setDecisionTime(null);


        return purchaseRequestRepository.save(request);
    }


    // =========================================================
    // AUTOMATIC MANAGER ESCALATION
    // =========================================================
    //
    // Runs every 60 seconds.
    //
    // If manager is unavailable:
    //     1. Start timer.
    //     2. Wait 48 hours.
    //     3. Find available senior manager.
    //     4. Reassign request.
    //
    // @Transactional is IMPORTANT here because assignedManager
    // is LAZY and we call manager.isAvailable().
    // =========================================================

    @Transactional
    @Scheduled(fixedRate = 60000)
    public void checkManagerEscalations() {

        List<PurchaseRequest> requests =
                purchaseRequestRepository.findByStatus(
                        Status.PENDING_MANAGER
                );


        for (PurchaseRequest request : requests) {

            User manager =
                    request.getAssignedManager();


            if (manager == null
                    || !manager.isAvailable()) {

                reassignIfManagerUnavailable(
                        request
                );
            }
        }


        purchaseRequestRepository.saveAll(
                requests
        );
    }
}