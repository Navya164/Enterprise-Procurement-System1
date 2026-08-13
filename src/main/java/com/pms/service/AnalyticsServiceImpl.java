package com.pms.service;

import com.assessment.auth.dto.CostOptimizationDTO;
import com.assessment.auth.dto.MonthlySpendDTO;
import com.assessment.auth.dto.ProcurementAnalyticsResponseDTO;
import com.assessment.auth.dto.ProcurementPerformanceDTO;
import com.assessment.auth.dto.SpendBreakdownDTO;
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
                    row[1] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[1];

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
         */

        List<Object[]> categoryRows =
                purchaseOrderRepository.getCategoryWiseSpend(
                        completedStatus
                );

        List<SpendBreakdownDTO> categorySpend =
                new ArrayList<>();

        for (Object[] row : categoryRows) {

            String category =
                    row[0] == null
                            ? "Uncategorized"
                            : row[0].toString();

            BigDecimal spend =
                    row[1] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[1];

            categorySpend.add(
                    new SpendBreakdownDTO(
                            category,
                            spend
                    )
            );
        }

        /*
         * ========================================================
         * MONTHLY SPEND
         * ========================================================
         */

        List<Object[]> monthlyRows =
                purchaseOrderRepository.getMonthlySpend(
                        completedStatus
                );

        List<MonthlySpendDTO> monthlySpend =
                new ArrayList<>();

        for (Object[] row : monthlyRows) {

            int year =
                    ((Number) row[0]).intValue();

            int monthNumber =
                    ((Number) row[1]).intValue();

            BigDecimal spend =
                    row[2] == null
                            ? BigDecimal.ZERO
                            : (BigDecimal) row[2];

            Month monthValue =
                    Month.of(monthNumber);

            String month =
                    monthValue.name().substring(0, 1)
                    +
                    monthValue.name()
                            .substring(1)
                            .toLowerCase()
                    +
                    " "
                    +
                    year;

            monthlySpend.add(
                    new MonthlySpendDTO(
                            month,
                            spend
                    )
            );
        }

        /*
         * ========================================================
         * PERFORMANCE
         * ========================================================
         */

        long totalPOs =
                purchaseOrderRepository.countAllPurchaseOrders();

        long completedPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.CLOSED
                );

        long rejectedPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.REJECTED
                );

        long createdPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.CREATED
                );

        long sentPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.SENT
                );

        long acceptedPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.ACCEPTED
                );

        long shippedPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.SHIPPED
                );

        long partiallyDeliveredPOs =
                purchaseOrderRepository.countPurchaseOrdersByStatus(
                        PurchaseOrderStatus.PARTIALLY_DELIVERED
                );

        /*
         * CREATED POs are treated as pending.
         */
        long pendingPOs = createdPOs;

        /*
         * These statuses represent POs currently moving
         * through the procurement workflow.
         */
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

        performance.setTotalPurchaseOrders(totalPOs);

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

        CostOptimizationDTO costOptimization =
                new CostOptimizationDTO();

        if (!vendorSpend.isEmpty()) {

            SpendBreakdownDTO highestVendor =
                    vendorSpend.get(0);

            costOptimization.setHighestSpendVendor(
                    highestVendor.getName()
            );

            costOptimization.setHighestVendorSpend(
                    highestVendor.getSpend()
            );
        }

        if (!categorySpend.isEmpty()) {

            SpendBreakdownDTO highestCategory =
                    categorySpend.get(0);

            costOptimization.setHighestSpendCategory(
                    highestCategory.getName()
            );

            costOptimization.setHighestCategorySpend(
                    highestCategory.getSpend()
            );
        }

        if (!monthlySpend.isEmpty()) {

            MonthlySpendDTO highestMonth =
                    monthlySpend.get(0);

            for (MonthlySpendDTO current : monthlySpend) {

                if (current.getSpend()
                        .compareTo(
                                highestMonth.getSpend()
                        ) > 0) {

                    highestMonth = current;
                }
            }

            costOptimization.setHighestSpendMonth(
                    highestMonth.getMonth()
            );

            costOptimization.setHighestMonthlySpend(
                    highestMonth.getSpend()
            );
        }

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

        return response;
    }

    private double calculatePercentage(
            long numerator,
            long denominator) {

        if (denominator == 0) {
            return 0.0;
        }

        return BigDecimal.valueOf(numerator)
                .multiply(BigDecimal.valueOf(100))
                .divide(
                        BigDecimal.valueOf(denominator),
                        2,
                        RoundingMode.HALF_UP
                )
                .doubleValue();
    }
}