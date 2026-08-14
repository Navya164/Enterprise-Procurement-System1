package com.pms.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.pms.dto.ProcurementReportDTO;
import com.pms.entity.PurchaseOrderStatus;
import com.pms.service.ProcurementReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:3000")
public class ProcurementReportController {

    private final ProcurementReportService reportService;

    public ProcurementReportController(
            ProcurementReportService reportService) {

        this.reportService = reportService;
    }

    @GetMapping("/procurement")
    public ResponseEntity<ProcurementReportDTO> getReport(

            @RequestParam(required = false)
            LocalDate fromDate,

            @RequestParam(required = false)
            LocalDate toDate,

            @RequestParam(required = false)
            String vendor,

            @RequestParam(required = false)
            PurchaseOrderStatus status,

            @RequestParam(required = false)
            String category) {

        return ResponseEntity.ok(
                reportService.generateReport(
                        fromDate,
                        toDate,
                        vendor,
                        status,
                        category
                )
        );
    }

    @GetMapping("/procurement/orders")
    public ResponseEntity<List<PurchaseOrderResponseDTO>>
    getFilteredOrders(

            @RequestParam(required = false)
            LocalDate fromDate,

            @RequestParam(required = false)
            LocalDate toDate,

            @RequestParam(required = false)
            String vendor,

            @RequestParam(required = false)
            PurchaseOrderStatus status,

            @RequestParam(required = false)
            String category) {

        return ResponseEntity.ok(
                reportService.getFilteredPurchaseOrders(
                        fromDate,
                        toDate,
                        vendor,
                        status,
                        category
                )
        );
    }
}