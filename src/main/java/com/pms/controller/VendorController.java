package com.pms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.pms.entity.PurchaseOrderStatus;
import com.pms.service.PurchaseOrderService;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin
public class VendorController {

    private final PurchaseOrderService purchaseOrderService;

    public VendorController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping("/orders")
    public List<PurchaseOrderResponseDTO> getVendorOrders() {

        return purchaseOrderService
                .getAllPurchaseOrders()
                .stream()
                .filter(po ->
                        po.getStatus() == PurchaseOrderStatus.SENT ||
                        po.getStatus() == PurchaseOrderStatus.ACCEPTED ||
                        po.getStatus() == PurchaseOrderStatus.SHIPPED ||
                        po.getStatus() == PurchaseOrderStatus.PARTIALLY_DELIVERED ||
                        po.getStatus() == PurchaseOrderStatus.DELIVERED ||
                        po.getStatus() == PurchaseOrderStatus.CLOSED ||
                        po.getStatus() == PurchaseOrderStatus.REJECTED ||
                        po.getStatus() == PurchaseOrderStatus.CANCELLED
                )
                .toList();
    }
}