package com.pms.service;

import com.assessment.auth.dto.CostOptimizationDTO;
import com.assessment.auth.dto.DeliveryPerformanceDTO;
import com.assessment.auth.dto.MonthlySpendDTO;
import com.assessment.auth.dto.ProcurementAnalyticsResponseDTO;
import com.assessment.auth.dto.ProcurementPerformanceDTO;
import com.assessment.auth.dto.SpendBreakdownDTO;
import com.pms.entity.PurchaseOrder;
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

    @Override
    public ProcurementAnalyticsResponseDTO getProcurementAnalytics() {

        /*
         * CLOSED is the completed state in the existing
         * Purchase Order workflow.
         */
        PurchaseOrderStatus completedStatus =
                PurchaseOrderStatus.CLOSED;


        /*
         * ========================================================
         * TOTAL PROCUREMENT SPEND
         * ========================================================
         */

        BigDecimal totalSpend =
                purchaseOrderRepository.getTotalSpendByStatus(
                        completedStatus
                );

        if (totalSpend == null) {
            totalSpend = BigDecimal.ZERO;
        }


        /*
         * ========================================================
         * VENDOR-WISE SPEND
         * ========================================================
         *
         * Repository returns:
         *
         * [0] -> vendor name
         * [1] -> total spend
         */

        List<Object[]> vendorRows =
                purchaseOrderRepository.getVendorWiseSpend(
                        completedStatus
                );

        List<SpendBreakdownDTO> vendorSpend =
                new ArrayList<>();

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


        /*
         * ========================================================
         * CATEGORY-WISE SPEND
         * ========================================================
         *
         * Repository returns:
         *
         * [0] -> category
         * [1] -> total spend
         */

        List<Object[]> categoryRows =
                purchaseOrderRepository.getCategoryWiseSpend(
                        completedStatus
                );

        List<SpendBreakdownDTO> categorySpend =
                new ArrayList<>();

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


        /*
         * ========================================================
         * MONTHLY SPEND
         * ========================================================
         *
         * Repository returns:
         *
         * [0] -> year
         * [1] -> month
         * [2] -> total spend
         */

        List<Object[]> monthlyRows =
                purchaseOrderRepository.getMonthlySpend(
                        completedStatus
                );

        List<MonthlySpendDTO> monthlySpend =
                new ArrayList<>();

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


        /*
         * ========================================================
         * PROCUREMENT PERFORMANCE
         * ========================================================
         */

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


        /*
         * In-progress Purchase Orders:
         *
         * SENT
         * ACCEPTED
         * SHIPPED
         * PARTIALLY_DELIVERED
         */

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


        /*
         * ========================================================
         * COST OPTIMIZATION INSIGHTS
         * ========================================================
         */

        String highestSpendVendor =
                "N/A";

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


        String highestSpendCategory =
                "N/A";

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


        String highestSpendMonth =
                "N/A";

        BigDecimal highestMonthlySpend =
                BigDecimal.ZERO;

        for (MonthlySpendDTO monthly : monthlySpend) {

            if (monthly.getSpend() != null &&
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


        /*
         * ========================================================
         * DELIVERY PERFORMANCE
         * ========================================================
         *
         * A completed delivery is a Purchase Order that has:
         *
         * DELIVERED or CLOSED status
         *
         * and delivered quantity equal to the ordered quantity.
         *
         * On-time / delayed classification requires both:
         *
         * 1. expectedDeliveryDate
         * 2. deliveryDate
         *
         * deliveryDate <= expectedDeliveryDate
         *       -> ON TIME
         *
         * deliveryDate > expectedDeliveryDate
         *       -> DELAYED
         *
         * Existing historical POs may have completed delivery
         * quantities but no deliveryDate because that field was
         * not recorded by the earlier workflow. Those orders are
         * still counted as delivered, but they are not classified
         * as on-time or delayed until an actual delivery date is
         * available.
         */

        List<PurchaseOrder> allPurchaseOrders =
                purchaseOrderRepository.findAll();

        long totalDeliveredOrders =
                0;

        long onTimeDeliveries =
                0;

        long delayedDeliveries =
                0;


        for (PurchaseOrder po : allPurchaseOrders) {

            PurchaseOrderStatus status =
                    po.getStatus();

            boolean completedDelivery =
                    status == PurchaseOrderStatus.DELIVERED
                    ||
                    status == PurchaseOrderStatus.CLOSED;

            if (!completedDelivery) {
                continue;
            }


            int orderedQuantity =
                    po.getQuantity() == null
                            ? 0
                            : po.getQuantity();

            int deliveredQuantity =
                    po.getDeliveredQuantity() == null
                            ? 0
                            : po.getDeliveredQuantity();


            /*
             * A PO is counted as delivered only when the
             * complete ordered quantity has been received.
             */
            if (orderedQuantity <= 0 ||
                deliveredQuantity < orderedQuantity) {

                continue;
            }


            totalDeliveredOrders++;


            /*
             * Historical completed POs can have no actual
             * delivery date. Do not invent a date and do not
             * classify such orders as on-time or delayed.
             */
            if (po.getExpectedDeliveryDate() == null ||
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


        /*
         * The rate is calculated only from deliveries for which
         * an actual delivery date is available.
         */
        long evaluatedDeliveries =
                onTimeDeliveries
                        + delayedDeliveries;

        double onTimeDeliveryRate =
                calculatePercentage(
                        onTimeDeliveries,
                        evaluatedDeliveries
                );


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


        /*
         * ========================================================
         * FINAL RESPONSE
         * ========================================================
         */

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


    /*
     * ============================================================
     * CONVERT QUERY VALUE TO BigDecimal
     * ============================================================
     */

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


    /*
     * ============================================================
     * MONTH NAME
     * ============================================================
     */

    private String getMonthName(int month) {

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


    /*
     * ============================================================
     * PERCENTAGE CALCULATION
     * ============================================================
     */

    private double calculatePercentage(
            long numerator,
            long denominator) {

        if (denominator == 0) {
            return 0.0;
        }

        return BigDecimal.valueOf(numerator)
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