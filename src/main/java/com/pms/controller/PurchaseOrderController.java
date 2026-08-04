package com.pms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.assessment.auth.dto.PurchaseOrderRequestDTO;
import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.assessment.auth.dto.PurchaseOrderStatusUpdateDTO;
import com.assessment.auth.dto.PurchaseOrderUpdateDTO;
import com.pms.service.PurchaseOrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    // CREATE - generates a PO from an approved Purchase Request
    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDTO> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequestDTO requestDTO) {
        PurchaseOrderResponseDTO created = purchaseOrderService.createPurchaseOrder(requestDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // READ ALL
    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponseDTO>> getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    // READ ONE
    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    // UPDATE (details only, not status)
    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO> updatePurchaseOrder(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderUpdateDTO updateDTO) {
        return ResponseEntity.ok(purchaseOrderService.updatePurchaseOrder(id, updateDTO));
    }

    // UPDATE STATUS (lifecycle transition)
    @PatchMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderResponseDTO> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody PurchaseOrderStatusUpdateDTO statusUpdateDTO) {
        return ResponseEntity.ok(purchaseOrderService.updateStatus(id, statusUpdateDTO));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(@PathVariable Long id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.noContent().build();
    }
}
