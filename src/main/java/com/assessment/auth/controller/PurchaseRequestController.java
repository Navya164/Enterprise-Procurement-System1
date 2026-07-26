package com.assessment.auth.controller;

import com.assessment.auth.dto.ApprovalDTO;
import com.assessment.auth.dto.PurchaseRequestDTO;
import com.assessment.auth.entity.PurchaseRequest;
import com.assessment.auth.service.PurchaseRequestService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseRequestController {

    private final PurchaseRequestService purchaseRequestService;

    public PurchaseRequestController(PurchaseRequestService purchaseRequestService) {
        this.purchaseRequestService = purchaseRequestService;
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

    // Manager approves/rejects
    @PostMapping("/approve/{requestId}")
    public ResponseEntity<PurchaseRequest> approveRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody ApprovalDTO approvalDTO) {

        PurchaseRequest request =
                purchaseRequestService.approveRequest(requestId, approvalDTO);

        return ResponseEntity.ok(request);
    }

    // Manager dashboard
    @GetMapping("/pending")
    public ResponseEntity<List<PurchaseRequest>> getPendingRequests() {

        return ResponseEntity.ok(
                purchaseRequestService.getPendingRequests()
        );

    }

    // Procurement dashboard
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

}