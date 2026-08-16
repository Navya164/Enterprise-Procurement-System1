package com.assessment.auth.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.assessment.auth.entity.User;
import com.assessment.auth.service.UserService;
import com.assessment.auth.dto.ApprovalDTO;
import com.assessment.auth.dto.PurchaseRequestDTO;
import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.service.PurchaseRequestService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/purchase")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseRequestController {

	private final PurchaseRequestService purchaseRequestService;
	private final UserService userService;

	public PurchaseRequestController(
	        PurchaseRequestService purchaseRequestService,
	        UserService userService) {

	    this.purchaseRequestService = purchaseRequestService;
	    this.userService = userService;
	}

    // Test API
    @GetMapping("/test")
    public String test() {
        return "Controller Working";
    }

    // Employee creates purchase request
    @PostMapping("/create/{employeeId}")
    public ResponseEntity<PurchaseRequest> createRequest(
            @PathVariable Long employeeId,
            @Valid @RequestBody PurchaseRequestDTO purchaseRequestDTO) {

        PurchaseRequest request =
                purchaseRequestService.createRequest(employeeId, purchaseRequestDTO);

        return ResponseEntity.ok(request);
    }

    // Employee Dashboard - My Requests
    @GetMapping("/myrequests/{employeeId}")
    public ResponseEntity<List<PurchaseRequest>> getEmployeeRequests(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                purchaseRequestService.getEmployeeRequests(employeeId)
        );
    }

    // Manager approves/rejects
    @PostMapping("/approve/{requestId}")
    public ResponseEntity<PurchaseRequest> approveRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody ApprovalDTO approvalDTO) {

        PurchaseRequest request =
                purchaseRequestService.approveRequest(requestId, approvalDTO);

        return ResponseEntity.ok(request);
    }

 // Undo manager approval/rejection
    @PostMapping("/undo/{requestId}/{managerId}")
    public ResponseEntity<PurchaseRequest> undoDecision(
            @PathVariable Long requestId,
            @PathVariable Long managerId) {

        PurchaseRequest request =
                purchaseRequestService.undoDecision(requestId, managerId);

        return ResponseEntity.ok(request);
    }

    // Manager Dashboard
    @GetMapping("/pending/{managerId}")
    public ResponseEntity<List<PurchaseRequest>> getPendingRequests(
            @PathVariable Long managerId) {

        return ResponseEntity.ok(
                purchaseRequestService.getPendingRequests(managerId)
        );
    }

    // Procurement Dashboard
    @GetMapping("/procurement")
    public ResponseEntity<List<PurchaseRequest>> getProcurementRequests() {

        return ResponseEntity.ok(
                purchaseRequestService.getProcurementRequests()
        );
    }

    // Start Procurement
    @PutMapping("/procurement/start/{requestId}")
    public ResponseEntity<PurchaseRequest> startProcurement(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                purchaseRequestService.startProcurement(requestId)
        );
    }

    // Complete Procurement
    @PutMapping("/procurement/complete/{requestId}")
    public ResponseEntity<PurchaseRequest> completeProcurement(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                purchaseRequestService.completeProcurement(requestId)
        );
    }

    // Workflow Tracker
    @GetMapping("/workflow/{requestId}")
    public ResponseEntity<PurchaseRequest> getWorkflow(
            @PathVariable Long requestId) {

        return ResponseEntity.ok(
                purchaseRequestService.getRequestById(requestId)
        );
    }

 // Manager availability
    @PutMapping("/availability/{managerId}")
    public ResponseEntity<User> updateAvailability(
            @PathVariable Long managerId,
            @RequestParam boolean available) {

        return ResponseEntity.ok(
                userService.updateAvailability(managerId, available)
        );
    }
}