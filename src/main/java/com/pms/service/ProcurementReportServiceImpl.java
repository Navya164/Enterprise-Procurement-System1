package com.pms.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.assessment.auth.dto.PurchaseOrderResponseDTO;
import com.pms.dto.ProcurementReportDTO;
import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderStatus;
import com.pms.repository.PurchaseOrderRepository;

@Service
public class ProcurementReportServiceImpl
        implements ProcurementReportService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public ProcurementReportServiceImpl(
            PurchaseOrderRepository purchaseOrderRepository) {

        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    @Override
    public List<PurchaseOrderResponseDTO> getFilteredPurchaseOrders(
            LocalDate fromDate,
            LocalDate toDate,
            String vendor,
            PurchaseOrderStatus status,
            String category) {

        LocalDateTime fromDateTime =
                fromDate == null
                        ? null
                        : fromDate.atStartOfDay();

        LocalDateTime toDateTime =
                toDate == null
                        ? null
                        : toDate.plusDays(1).atStartOfDay().minusNanos(1);

        return purchaseOrderRepository
                .findPurchaseOrdersForReport(
                        fromDateTime,
                        toDateTime,
                        vendor,
                        status,
                        category
                )
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProcurementReportDTO generateReport(
            LocalDate fromDate,
            LocalDate toDate,
            String vendor,
            PurchaseOrderStatus status,
            String category) {

        LocalDateTime fromDateTime =
                fromDate == null
                        ? null
                        : fromDate.atStartOfDay();

        LocalDateTime toDateTime =
                toDate == null
                        ? null
                        : toDate.plusDays(1)
                                .atStartOfDay()
                                .minusNanos(1);

        List<PurchaseOrder> orders =
                purchaseOrderRepository.findPurchaseOrdersForReport(
                        fromDateTime,
                        toDateTime,
                        vendor,
                        status,
                        category
                );

        ProcurementReportDTO report =
                new ProcurementReportDTO();

        report.setTotalPOs(orders.size());

        report.setPendingPOs(
                orders.stream()
                        .filter(po ->
                                po.getStatus() == PurchaseOrderStatus.SENT
                        )
                        .count()
        );

        report.setInProgressPOs(
                orders.stream()
                        .filter(po ->
                                po.getStatus() == PurchaseOrderStatus.ACCEPTED
                                ||
                                po.getStatus() == PurchaseOrderStatus.SHIPPED
                                ||
                                po.getStatus() == PurchaseOrderStatus.PARTIALLY_DELIVERED
                        )
                        .count()
        );

        report.setCompletedPOs(
                orders.stream()
                        .filter(po ->
                                po.getStatus() == PurchaseOrderStatus.CLOSED
                                ||
                                po.getStatus() == PurchaseOrderStatus.DELIVERED
                        )
                        .count()
        );

        report.setRejectedPOs(
                orders.stream()
                        .filter(po ->
                                po.getStatus() == PurchaseOrderStatus.REJECTED
                        )
                        .count()
        );

        BigDecimal totalSpend =
                orders.stream()
                        .map(PurchaseOrder::getTotalAmount)
                        .filter(amount -> amount != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );

        report.setTotalSpend(totalSpend);

        /*
         * Vendor-wise spend
         */
        Map<String, BigDecimal> vendorSpend =
                orders.stream()
                        .filter(po -> po.getVendorName() != null)
                        .collect(Collectors.groupingBy(
                                PurchaseOrder::getVendorName,
                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        PurchaseOrder::getTotalAmount,
                                        BigDecimal::add
                                )
                        ));

        report.setVendorWiseSpend(
                vendorSpend.entrySet()
                        .stream()
                        .map(entry ->
                                new ProcurementReportDTO.SpendItem(
                                        entry.getKey(),
                                        entry.getValue()
                                )
                        )
                        .sorted(
                                (a, b) ->
                                        b.getAmount()
                                                .compareTo(a.getAmount())
                        )
                        .collect(Collectors.toList())
        );

        /*
         * Category-wise spend
         */
        Map<String, BigDecimal> categorySpend =
                orders.stream()
                        .filter(po ->
                                po.getPurchaseRequest() != null
                                &&
                                po.getPurchaseRequest()
                                        .getCategory() != null
                        )
                        .collect(Collectors.groupingBy(
                                po ->
                                        po.getPurchaseRequest()
                                                .getCategory(),
                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        PurchaseOrder::getTotalAmount,
                                        BigDecimal::add
                                )
                        ));

        report.setCategoryWiseSpend(
                categorySpend.entrySet()
                        .stream()
                        .map(entry ->
                                new ProcurementReportDTO.SpendItem(
                                        entry.getKey(),
                                        entry.getValue()
                                )
                        )
                        .sorted(
                                (a, b) ->
                                        b.getAmount()
                                                .compareTo(a.getAmount())
                        )
                        .collect(Collectors.toList())
        );

        /*
         * Monthly spend
         */
        Map<String, BigDecimal> monthlySpend =
                orders.stream()
                        .filter(po -> po.getCreatedAt() != null)
                        .collect(Collectors.groupingBy(
                                po ->
                                        po.getCreatedAt()
                                                .getYear()
                                                + "-"
                                                + String.format(
                                                        "%02d",
                                                        po.getCreatedAt()
                                                                .getMonthValue()
                                                ),
                                Collectors.reducing(
                                        BigDecimal.ZERO,
                                        PurchaseOrder::getTotalAmount,
                                        BigDecimal::add
                                )
                        ));

        report.setMonthlySpend(
                monthlySpend.entrySet()
                        .stream()
                        .sorted(Map.Entry.comparingByKey())
                        .map(entry -> {

                            String[] parts =
                                    entry.getKey().split("-");

                            return new ProcurementReportDTO.MonthlySpend(
                                    Integer.parseInt(parts[0]),
                                    Integer.parseInt(parts[1]),
                                    entry.getValue()
                            );
                        })
                        .collect(Collectors.toList())
        );

        return report;
    }

    private PurchaseOrderResponseDTO toDTO(
            PurchaseOrder po) {

        PurchaseOrderResponseDTO dto =
                new PurchaseOrderResponseDTO();

        dto.setId(po.getId());

        dto.setPoNumber(po.getPoNumber());

        dto.setPurchaseRequestId(
                po.getPurchaseRequest()
                        .getRequestId()
        );

        dto.setVendorName(
                po.getVendorName()
        );

        dto.setVendorEmail(
                po.getVendorEmail()
        );

        dto.setItemName(
                po.getItemName()
        );

        dto.setQuantity(
                po.getQuantity()
        );

        dto.setDeliveredQuantity(
                po.getDeliveredQuantity()
        );

        dto.setUnitPrice(
                po.getUnitPrice()
        );

        dto.setTotalAmount(
                po.getTotalAmount()
        );

        dto.setStatus(
                po.getStatus()
        );

        dto.setExpectedDeliveryDate(
                po.getExpectedDeliveryDate()
        );

        dto.setCreatedAt(
                po.getCreatedAt()
        );

        dto.setUpdatedAt(
                po.getUpdatedAt()
        );

        return dto;
    }
}