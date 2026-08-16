package com.assessment.auth.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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
import org.springframework.scheduling.annotation.Scheduled;

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

	            // Assign the manager even if unavailable.
	            // If unavailable, the 48-hour escalation timer
	            // will handle it.
	            request.setAssignedManager(manager);

	            request.setCurrentLevel(
	                    "MANAGER_LEVEL_" + level.getApprovalLevel()
	            );

	            return;
	        }
	    }

	    throw new RuntimeException(
	            "No manager found for this request"
	    );
	}

	private void reassignIfManagerUnavailable(PurchaseRequest request) {

	    User currentManager = request.getAssignedManager();

	    // Manager is available -> reset unavailable timer
	    if (currentManager != null && currentManager.isAvailable()) {
	        request.setManagerUnavailableSince(null);
	        return;
	    }

	    // Manager is unavailable for the first time
	    if (request.getManagerUnavailableSince() == null) {
	        request.setManagerUnavailableSince(LocalDateTime.now());
	        return;
	    }

	    // Check whether 48 hours have passed
	    LocalDateTime escalationTime =
	            request.getManagerUnavailableSince().plusHours(48);

	    if (LocalDateTime.now().isBefore(escalationTime)) {
	        // Still within 48 hours -> keep request pending
	        return;
	    }

	    // 48 hours completed -> find Senior Manager
	    User seniorManager = userRepository
	            .findAll()
	            .stream()
	            .filter(user ->
	                    user.getRole() == Role.SENIOR_MANAGER
	                    && user.isAvailable()
	            )
	            .findFirst()
	            .orElseThrow(() -> new RuntimeException(
	                    "No available senior manager found"
	            ));

	    // Escalate request
	    request.setAssignedManager(seniorManager);
	    request.setCurrentLevel("SENIOR_MANAGER");

	    // Reset timer after escalation
	    request.setManagerUnavailableSince(null);
	}

    // Employee creates purchase request
    public PurchaseRequest createRequest(Long employeeId,
                                         PurchaseRequestDTO dto) {


        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));


        // Check maximum 2 active requests
        long activeCount = purchaseRequestRepository.countByEmployeeIdAndStatusIn(
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
                    "You already have 2 pending purchase requests. Please wait until one request is approved, rejected, or completed before submitting a new request."
            );
        }


        PurchaseRequest request = new PurchaseRequest();

        request.setEmployee(employee);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setQuantity(dto.getQuantity());
        request.setCategory(dto.getCategory());
        request.setAmount(dto.getAmount());
        request.setPriority(
                Priority.valueOf(dto.getPriority())
        );

        request.setStatus(Status.PENDING_MANAGER);

        assignManager(request);

        // Start 48-hour escalation timer if assigned manager is unavailable
        if (request.getAssignedManager() == null ||
                !request.getAssignedManager().isAvailable()) {

            request.setManagerUnavailableSince(LocalDateTime.now());
        }

        return purchaseRequestRepository.save(request);
    }

    public PurchaseRequest approveRequest(Long requestId,
            ApprovalDTO dto) {

				PurchaseRequest request =
				purchaseRequestRepository.findById(requestId)
				.orElseThrow(() -> new RuntimeException(
				  "Purchase Request not found"
				));

				if (request.getAssignedManager() == null) {
				throw new RuntimeException(
				"No manager is assigned to this purchase request"
				);
	}

				if (dto.getManagerId() == null ||
				!request.getAssignedManager().getId().equals(dto.getManagerId())) {

				throw new ResponseStatusException(
				HttpStatus.FORBIDDEN,
				"You are not authorized to approve or reject this request"
				);
		}

				// Save the current status before changing it
				request.setPreviousStatus(request.getStatus().name());
				request.setDecisionTime(LocalDateTime.now());

				if (dto.isApproved()) {

				    request.setStatus(Status.PENDING_PROCUREMENT);
				    request.setCurrentLevel("PROCUREMENT");

				} else {

				    request.setStatus(Status.REJECTED);
				    request.setCurrentLevel("REJECTED");
				}

				request.setRemarks(dto.getRemarks());
				request.setApprovalDate(LocalDateTime.now());
				request.setExpiryDate(
				LocalDateTime.now().plusDays(15)
				);

				return purchaseRequestRepository.save(request);
				}



    // Employee Dashboard
    public List<PurchaseRequest> getEmployeeRequests(Long employeeId) {


        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException(
                        "Employee not found"
                ));


        return purchaseRequestRepository.findByEmployee(employee);
    }


    // Manager Dashboard
    public List<PurchaseRequest> getPendingRequests(Long managerId) {

        User manager = userRepository.findById(managerId)
                .orElseThrow(() -> new RuntimeException(
                        "Manager not found"
                ));

        if (manager.getRole() != Role.MANAGER &&
                manager.getRole() != Role.SENIOR_MANAGER) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "User is not authorized to view manager requests"
            );
        }

        List<PurchaseRequest> requests =
                purchaseRequestRepository.findByAssignedManagerAndStatus(
                        manager,
                        Status.PENDING_MANAGER
                );

        if (manager.getRole() == Role.MANAGER) {
            for (PurchaseRequest request : requests) {
                reassignIfManagerUnavailable(request);
            }
        }

        return purchaseRequestRepository.saveAll(requests);
    }

  // Procurement Dashboard

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


        System.out.println("PENDING = " + pending.size());
        System.out.println("PROGRESS = " + progress.size());
        System.out.println("COMPLETED = " + completed.size());


        completed.forEach(r ->
            System.out.println(
                "Completed ID = " + r.getRequestId()
            )
        );


        List<PurchaseRequest> requests = new ArrayList<>();

        requests.addAll(pending);
        requests.addAll(progress);
        requests.addAll(completed);


        return requests;
    }

    // Start Procurement
    public PurchaseRequest startProcurement(Long requestId) {


        PurchaseRequest request = purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Request not found"
                ));


        request.setStatus(
                Status.PROCUREMENT_IN_PROGRESS
        );

        request.setCurrentLevel(
                "PROCUREMENT"
        );


        return purchaseRequestRepository.save(request);
    }





    // Complete Procurement
    public PurchaseRequest completeProcurement(Long requestId) {


        PurchaseRequest request = purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Request not found"
                ));


        request.setStatus(
                Status.COMPLETED
        );

        request.setCurrentLevel(
                "COMPLETED"
        );


        return purchaseRequestRepository.save(request);
    }


    // Workflow Tracker
    public PurchaseRequest getRequestById(Long requestId) {


        return purchaseRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException(
                        "Purchase Request not found"
                ));
    }

 // Undo manager approval/rejection within 3 minutes
    public PurchaseRequest undoDecision(Long requestId, Long managerId) {

        PurchaseRequest request =
                purchaseRequestRepository.findById(requestId)
                        .orElseThrow(() -> new RuntimeException(
                                "Purchase Request not found"
                        ));

        // Make sure the manager who is undoing is the assigned manager
        if (request.getAssignedManager() == null ||
                !request.getAssignedManager().getId().equals(managerId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to undo this decision"
            );
        }

        // Make sure a decision actually exists
        if (request.getDecisionTime() == null ||
                request.getPreviousStatus() == null) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "No recent decision is available to undo"
            );
        }

        // Check 3-minute undo window
        LocalDateTime now = LocalDateTime.now();

        if (now.isAfter(request.getDecisionTime().plusMinutes(3))) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Undo period has expired. The decision is now permanent."
            );
        }

        // Restore previous status
        Status previousStatus =
                Status.valueOf(request.getPreviousStatus());

        request.setStatus(previousStatus);

        // Restore manager level
        if (previousStatus == Status.PENDING_MANAGER) {
            request.setCurrentLevel(
                    request.getAssignedManager() != null
                            ? "MANAGER_LEVEL"
                            : "MANAGER"
            );
        }

        // Clear undo information so it cannot be undone repeatedly
        request.setPreviousStatus(null);
        request.setDecisionTime(null);

        return purchaseRequestRepository.save(request);
    }
    @Scheduled(fixedRate = 60000)
    public void checkManagerEscalations() {

        List<PurchaseRequest> requests =
                purchaseRequestRepository.findByStatus(
                        Status.PENDING_MANAGER
                );

        for (PurchaseRequest request : requests) {

            User manager = request.getAssignedManager();

            if (manager == null || !manager.isAvailable()) {
                reassignIfManagerUnavailable(request);
            }
        }

        purchaseRequestRepository.saveAll(requests);
    }

}