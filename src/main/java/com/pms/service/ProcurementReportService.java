package com.pms.service;

import java.time.LocalDate;
import java.util.List;

import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.pms.dto.ProcurementReportDTO;
import com.pms.entity.PurchaseOrderStatus;

public interface ProcurementReportService {

    ProcurementReportDTO generateReport(
            LocalDate fromDate,
            LocalDate toDate,
            String vendor,
            PurchaseOrderStatus status,
            String category
    );

    List<PurchaseOrderResponseDTO> getFilteredPurchaseOrders(
            LocalDate fromDate,
            LocalDate toDate,
            String vendor,
            PurchaseOrderStatus status,
            String category
    );
}