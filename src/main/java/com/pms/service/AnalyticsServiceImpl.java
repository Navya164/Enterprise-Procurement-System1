package com.pms.service;

import com.assessment.auth.dto.CostOptimizationDTO;
import com.assessment.auth.dto.DeliveryPerformanceDTO;
import com.assessment.auth.dto.MonthlySpendDTO;
import com.assessment.auth.dto.ProcurementAnalyticsResponseDTO;
import com.assessment.auth.dto.ProcurementPerformanceDTO;
import com.assessment.auth.dto.SpendBreakdownDTO;

import com.pms.entity.PurchaseOrder;
import com.pms.entity.PurchaseOrderItem;
import com.pms.entity.PurchaseOrderStatus;
import com.pms.repository.PurchaseOrderRepository;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PurchaseOrderRepository purchaseOrderRepository;

    public AnalyticsServiceImpl(
            PurchaseOrderRepository purchaseOrderRepository) {

        this.purchaseOrderRepository = purchaseOrderRepository;
    }


    // ============================================================
    // MAIN ANALYTICS
    // ============================================================

    @Override
    public ProcurementAnalyticsResponseDTO getProcurementAnalytics() {

        /*
         * CLOSED is treated as the completed procurement state.
         */
        PurchaseOrderStatus completedStatus =
                PurchaseOrderStatus.CLOSED;


        // ========================================================
        // TOTAL PROCUREMENT SPEND
        // ========================================================

        BigDecimal totalSpend =
                purchaseOrderRepository.getTotalSpendByStatus(
                        completedStatus
                );

        if (totalSpend == null) {
            totalSpend = BigDecimal.ZERO;
        }


        // ========================================================
        // VENDOR-WISE SPEND
        // ========================================================

        List<Object[]> vendorRows =
                purchaseOrderRepository.getVendorWiseSpend(
                        completedStatus
                );

        List<SpendBreakdownDTO> vendorSpend =
                new ArrayList<>();

        if (vendorRows != null) {

            for (Object[] row : vendorRows) {

                String vendorName =
                        row[0] == null
                                ? "Unknown Vendor"
                                : row[0].toString();

                BigDecimal spend =
                        toBigDecimal(row[1]);

                vendorSpend.add(
                        new SpendBreakdownDTO(
                                vendorName,
                                spend
                        )
                );
            }
        }


        // ========================================================
        // CATEGORY-WISE SPEND
        // ========================================================

        List<Object[]> categoryRows =
                purchaseOrderRepository.getCategoryWiseSpend(
                        completedStatus
                );

        List<SpendBreakdownDTO> categorySpend =
                new ArrayList<>();

        if (categoryRows != null) {

            for (Object[] row : categoryRows) {

                String categoryName =
                        row[0] == null
                                ? "Unknown Category"
                                : row[0].toString();

                BigDecimal spend =
                        toBigDecimal(row[1]);

                categorySpend.add(
                        new SpendBreakdownDTO(
                                categoryName,
                                spend
                        )
                );
            }
        }


        // ========================================================
        // MONTHLY SPEND
        // ========================================================

        List<Object[]> monthlyRows =
                purchaseOrderRepository.getMonthlySpend(
                        completedStatus
                );

        List<MonthlySpendDTO> monthlySpend =
                new ArrayList<>();

        if (monthlyRows != null) {

            for (Object[] row : monthlyRows) {

                int year =
                        row[0] != null
                                ? ((Number) row[0]).intValue()
                                : 0;

                int month =
                        row[1] != null
                                ? ((Number) row[1]).intValue()
                                : 0;

                BigDecimal spend =
                        toBigDecimal(row[2]);

                String monthName =
                        getMonthName(month)
                                + " "
                                + year;

                monthlySpend.add(
                        new MonthlySpendDTO(
                                monthName,
                                spend
                        )
                );
            }
        }


        // ========================================================
        // PROCUREMENT PERFORMANCE
        // ========================================================

        long totalPOs =
                purchaseOrderRepository
                        .countAllPurchaseOrders();


        long completedPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.CLOSED
                        );


        long rejectedPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.REJECTED
                        );


        long pendingPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.CREATED
                        );


        // ========================================================
        // IN-PROGRESS PURCHASE ORDERS
        // ========================================================

        long sentPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.SENT
                        );


        long acceptedPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.ACCEPTED
                        );


        long shippedPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.SHIPPED
                        );


        long partiallyDeliveredPOs =
                purchaseOrderRepository
                        .countPurchaseOrdersByStatus(
                                PurchaseOrderStatus.PARTIALLY_DELIVERED
                        );


        long inProgressPOs =
                sentPOs
                        + acceptedPOs
                        + shippedPOs
                        + partiallyDeliveredPOs;


        // ========================================================
        // RATES
        // ========================================================

        double completionRate =
                calculatePercentage(
                        completedPOs,
                        totalPOs
                );


        double rejectionRate =
                calculatePercentage(
                        rejectedPOs,
                        totalPOs
                );


        // ========================================================
        // PERFORMANCE DTO
        // ========================================================

        ProcurementPerformanceDTO performance =
                new ProcurementPerformanceDTO();


        performance.setTotalPurchaseOrders(
                totalPOs
        );


        performance.setCompletedPurchaseOrders(
                completedPOs
        );


        performance.setRejectedPurchaseOrders(
                rejectedPOs
        );


        performance.setPendingPurchaseOrders(
                pendingPOs
        );


        performance.setInProgressPurchaseOrders(
                inProgressPOs
        );


        performance.setCompletionRate(
                completionRate
        );


        performance.setRejectionRate(
                rejectionRate
        );


        // ========================================================
        // COST OPTIMIZATION
        // ========================================================

        String highestSpendVendor = "N/A";

        BigDecimal highestVendorSpend =
                BigDecimal.ZERO;


        if (!vendorSpend.isEmpty()) {

            SpendBreakdownDTO highestVendor =
                    vendorSpend.get(0);

            highestSpendVendor =
                    highestVendor.getName();

            highestVendorSpend =
                    highestVendor.getSpend();
        }


        String highestSpendCategory = "N/A";

        BigDecimal highestCategorySpend =
                BigDecimal.ZERO;


        if (!categorySpend.isEmpty()) {

            SpendBreakdownDTO highestCategory =
                    categorySpend.get(0);

            highestSpendCategory =
                    highestCategory.getName();

            highestCategorySpend =
                    highestCategory.getSpend();
        }


        String highestSpendMonth = "N/A";

        BigDecimal highestMonthlySpend =
                BigDecimal.ZERO;


        for (MonthlySpendDTO monthly :
                monthlySpend) {

            if (monthly.getSpend() != null
                    &&
                monthly.getSpend()
                        .compareTo(
                                highestMonthlySpend
                        ) > 0) {

                highestMonthlySpend =
                        monthly.getSpend();

                highestSpendMonth =
                        monthly.getMonth();
            }
        }


        CostOptimizationDTO costOptimization =
                new CostOptimizationDTO();


        costOptimization.setHighestSpendVendor(
                highestSpendVendor
        );


        costOptimization.setHighestVendorSpend(
                highestVendorSpend
        );


        costOptimization.setHighestSpendCategory(
                highestSpendCategory
        );


        costOptimization.setHighestCategorySpend(
                highestCategorySpend
        );


        costOptimization.setHighestSpendMonth(
                highestSpendMonth
        );


        costOptimization.setHighestMonthlySpend(
                highestMonthlySpend
        );


        // ========================================================
        // DELIVERY PERFORMANCE
        // ========================================================
        //
        // IMPORTANT:
        //
        // PurchaseOrder is now MULTI ITEM.
        //
        // Therefore quantity and deliveredQuantity
        // must be calculated from PurchaseOrderItem.
        //
        // Old code:
        //
        // po.getQuantity()
        // po.getDeliveredQuantity()
        //
        // These are NO LONGER USED.
        //


        List<PurchaseOrder> allPurchaseOrders =
                purchaseOrderRepository.findAll();


        long totalDeliveredOrders = 0;

        long onTimeDeliveries = 0;

        long delayedDeliveries = 0;


        for (PurchaseOrder po :
                allPurchaseOrders) {

            PurchaseOrderStatus status =
                    po.getStatus();


            // ----------------------------------------------------
            // Only DELIVERED / CLOSED POs count
            // ----------------------------------------------------

            boolean completedDelivery =
                    status == PurchaseOrderStatus.DELIVERED
                    ||
                    status == PurchaseOrderStatus.CLOSED;


            if (!completedDelivery) {
                continue;
            }


            // ----------------------------------------------------
            // Calculate total ordered quantity
            // from all PO items
            // ----------------------------------------------------

            int orderedQuantity =
                    getTotalOrderedQuantity(po);


            // ----------------------------------------------------
            // Calculate total delivered quantity
            // from all PO items
            // ----------------------------------------------------

            int deliveredQuantity =
                    getTotalDeliveredQuantity(po);


            // ----------------------------------------------------
            // Complete delivery check
            // ----------------------------------------------------

            if (orderedQuantity <= 0
                    ||
                deliveredQuantity < orderedQuantity) {

                continue;
            }


            totalDeliveredOrders++;


            // ----------------------------------------------------
            // Date based delivery performance
            // ----------------------------------------------------

            if (po.getExpectedDeliveryDate() == null
                    ||
                po.getDeliveryDate() == null) {

                continue;
            }


            if (!po.getDeliveryDate()
                    .isAfter(
                            po.getExpectedDeliveryDate()
                    )) {

                onTimeDeliveries++;

            } else {

                delayedDeliveries++;
            }
        }


        // ========================================================
        // ON-TIME DELIVERY RATE
        // ========================================================

        long evaluatedDeliveries =
                onTimeDeliveries
                        + delayedDeliveries;


        double onTimeDeliveryRate =
                calculatePercentage(
                        onTimeDeliveries,
                        evaluatedDeliveries
                );


        // ========================================================
        // DELIVERY PERFORMANCE DTO
        // ========================================================

        DeliveryPerformanceDTO deliveryPerformance =
                new DeliveryPerformanceDTO();


        deliveryPerformance.setTotalDeliveredOrders(
                totalDeliveredOrders
        );


        deliveryPerformance.setOnTimeDeliveries(
                onTimeDeliveries
        );


        deliveryPerformance.setDelayedDeliveries(
                delayedDeliveries
        );


        deliveryPerformance.setOnTimeDeliveryRate(
                onTimeDeliveryRate
        );


        // ========================================================
        // FINAL RESPONSE
        // ========================================================

        ProcurementAnalyticsResponseDTO response =
                new ProcurementAnalyticsResponseDTO();


        response.setTotalProcurementSpend(
                totalSpend
        );


        response.setVendorWiseSpend(
                vendorSpend
        );


        response.setCategoryWiseSpend(
                categorySpend
        );


        response.setMonthlySpend(
                monthlySpend
        );


        response.setPerformance(
                performance
        );


        response.setCostOptimization(
                costOptimization
        );


        response.setDeliveryPerformance(
                deliveryPerformance
        );


        return response;
    }


    // ============================================================
    // TOTAL ORDERED QUANTITY FROM ALL ITEMS
    // ============================================================

    private int getTotalOrderedQuantity(
            PurchaseOrder po) {

        if (po.getItems() == null) {
            return 0;
        }


        int total = 0;


        for (PurchaseOrderItem item :
                po.getItems()) {

            if (item == null) {
                continue;
            }


            Integer quantity =
                    item.getQuantity();


            if (quantity != null) {

                total += quantity;
            }
        }


        return total;
    }


    // ============================================================
    // TOTAL DELIVERED QUANTITY FROM ALL ITEMS
    // ============================================================

    private int getTotalDeliveredQuantity(
            PurchaseOrder po) {

        if (po.getItems() == null) {
            return 0;
        }


        int total = 0;


        for (PurchaseOrderItem item :
                po.getItems()) {

            if (item == null) {
                continue;
            }


            Integer deliveredQuantity =
                    item.getDeliveredQuantity();


            if (deliveredQuantity != null) {

                total += deliveredQuantity;
            }
        }


        return total;
    }


    // ============================================================
    // CONVERT OBJECT -> BIG DECIMAL
    // ============================================================

    private BigDecimal toBigDecimal(
            Object value) {

        if (value == null) {
            return BigDecimal.ZERO;
        }


        if (value instanceof BigDecimal) {

            return (BigDecimal) value;
        }


        if (value instanceof Number) {

            return BigDecimal.valueOf(
                    ((Number) value).doubleValue()
            );
        }


        return new BigDecimal(
                value.toString()
        );
    }


    // ============================================================
    // MONTH NAME
    // ============================================================

    private String getMonthName(
            int month) {

        if (month < 1 || month > 12) {

            return "Unknown";
        }


        Month monthValue =
                Month.of(month);


        String monthName =
                monthValue.name();


        return monthName.substring(0, 1)
                +
                monthName
                        .substring(1)
                        .toLowerCase();
    }


    // ============================================================
    // PERCENTAGE
    // ============================================================

    private double calculatePercentage(
            long numerator,
            long denominator) {

        if (denominator == 0) {

            return 0.0;
        }


        return BigDecimal
                .valueOf(numerator)

                .multiply(
                        BigDecimal.valueOf(100)
                )

                .divide(
                        BigDecimal.valueOf(denominator),
                        2,
                        RoundingMode.HALF_UP
                )

                .doubleValue();
    }
}