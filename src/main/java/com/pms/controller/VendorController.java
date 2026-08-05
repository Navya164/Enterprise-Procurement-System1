package com.pms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.pms.service.PurchaseOrderService;

@RestController
@RequestMapping("/api/vendor")
@CrossOrigin
public class VendorController {


    private final PurchaseOrderService purchaseOrderService;


    public VendorController(
            PurchaseOrderService purchaseOrderService) {

        this.purchaseOrderService = purchaseOrderService;
    }


    @GetMapping("/orders")
    public List<PurchaseOrderResponseDTO> getVendorOrders(){

        return purchaseOrderService
                .getAllPurchaseOrders()
                .stream()
                .filter(po -> 
                    po.getStatus().name()
                    .equals("SENT"))
                .toList();
    }

}