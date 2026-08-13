package com.assessment.auth.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProcurementAnalyticsResponseDTO {

    private BigDecimal totalProcurementSpend;

    private List<SpendBreakdownDTO> vendorWiseSpend;

    private List<SpendBreakdownDTO> categoryWiseSpend;

    private List<MonthlySpendDTO> monthlySpend;

    private ProcurementPerformanceDTO performance;

    private CostOptimizationDTO costOptimization;

    public ProcurementAnalyticsResponseDTO() {
    }

    public BigDecimal getTotalProcurementSpend() {
        return totalProcurementSpend;
    }

    public void setTotalProcurementSpend(
            BigDecimal totalProcurementSpend) {

        this.totalProcurementSpend = totalProcurementSpend;
    }

    public List<SpendBreakdownDTO> getVendorWiseSpend() {
        return vendorWiseSpend;
    }

    public void setVendorWiseSpend(
            List<SpendBreakdownDTO> vendorWiseSpend) {

        this.vendorWiseSpend = vendorWiseSpend;
    }

    public List<SpendBreakdownDTO> getCategoryWiseSpend() {
        return categoryWiseSpend;
    }

    public void setCategoryWiseSpend(
            List<SpendBreakdownDTO> categoryWiseSpend) {

        this.categoryWiseSpend = categoryWiseSpend;
    }

    public List<MonthlySpendDTO> getMonthlySpend() {
        return monthlySpend;
    }

    public void setMonthlySpend(
            List<MonthlySpendDTO> monthlySpend) {

        this.monthlySpend = monthlySpend;
    }

    public ProcurementPerformanceDTO getPerformance() {
        return performance;
    }

    public void setPerformance(
            ProcurementPerformanceDTO performance) {

        this.performance = performance;
    }

    public CostOptimizationDTO getCostOptimization() {
        return costOptimization;
    }

    public void setCostOptimization(
            CostOptimizationDTO costOptimization) {

        this.costOptimization = costOptimization;
    }
}