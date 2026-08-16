package com.pms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    public PurchaseOrderController(
            PurchaseOrderService purchaseOrderService) {

        this.purchaseOrderService = purchaseOrderService;
    }


    // =========================================================
    // CREATE PURCHASE ORDER
    // POST /api/purchase-orders
    // =========================================================

    @PostMapping
    public ResponseEntity<PurchaseOrderResponseDTO> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderRequestDTO requestDTO) {

        PurchaseOrderResponseDTO created =
                purchaseOrderService.createPurchaseOrder(requestDTO);

        return new ResponseEntity<>(
                created,
                HttpStatus.CREATED
        );
    }


    // =========================================================
    // GET ALL PURCHASE ORDERS
    // GET /api/purchase-orders
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PurchaseOrderResponseDTO>>
            getAllPurchaseOrders() {

        return ResponseEntity.ok(
                purchaseOrderService.getAllPurchaseOrders()
        );
    }


    // =========================================================
    // GET PURCHASE ORDER BY ID
    // GET /api/purchase-orders/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO>
            getPurchaseOrderById(
                    @PathVariable Long id) {

        return ResponseEntity.ok(
                purchaseOrderService.getPurchaseOrderById(id)
        );
    }


    // =========================================================
    // UPDATE PURCHASE ORDER DETAILS
    // PUT /api/purchase-orders/{id}
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<PurchaseOrderResponseDTO>
            updatePurchaseOrder(
                    @PathVariable Long id,
                    @Valid @RequestBody PurchaseOrderUpdateDTO updateDTO) {

        return ResponseEntity.ok(
                purchaseOrderService.updatePurchaseOrder(
                        id,
                        updateDTO
                )
        );
    }


    // =========================================================
    // UPDATE PURCHASE ORDER STATUS
    // PUT /api/purchase-orders/{id}/status
    // =========================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<PurchaseOrderResponseDTO>
            updatePurchaseOrderStatus(
                    @PathVariable Long id,
                    @Valid @RequestBody PurchaseOrderStatusUpdateDTO statusDTO) {

        return ResponseEntity.ok(
                purchaseOrderService.updateStatus(
                        id,
                        statusDTO
                )
        );
    }


    // =========================================================
    // DELETE PURCHASE ORDER
    // DELETE /api/purchase-orders/{id}
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePurchaseOrder(
            @PathVariable Long id) {

        purchaseOrderService.deletePurchaseOrder(id);

        return ResponseEntity.noContent().build();
    }
}