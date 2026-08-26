package com.assessment.auth.dto;

import java.math.BigDecimal;

public class CostOptimizationDTO {

    private String highestSpendVendor;
    private BigDecimal highestVendorSpend;

    private String highestSpendCategory;
    private BigDecimal highestCategorySpend;

    private String highestSpendMonth;
    private BigDecimal highestMonthlySpend;

    public CostOptimizationDTO() {
    }

    public String getHighestSpendVendor() {
        return highestSpendVendor;
    }

    public void setHighestSpendVendor(String highestSpendVendor) {
        this.highestSpendVendor = highestSpendVendor;
    }

    public BigDecimal getHighestVendorSpend() {
        return highestVendorSpend;
    }

    public void setHighestVendorSpend(BigDecimal highestVendorSpend) {
        this.highestVendorSpend = highestVendorSpend;
    }

    public String getHighestSpendCategory() {
        return highestSpendCategory;
    }

    public void setHighestSpendCategory(String highestSpendCategory) {
        this.highestSpendCategory = highestSpendCategory;
    }

    public BigDecimal getHighestCategorySpend() {
        return highestCategorySpend;
    }

    public void setHighestCategorySpend(BigDecimal highestCategorySpend) {
        this.highestCategorySpend = highestCategorySpend;
    }

    public String getHighestSpendMonth() {
        return highestSpendMonth;
    }

    public void setHighestSpendMonth(String highestSpendMonth) {
        this.highestSpendMonth = highestSpendMonth;
    }

    public BigDecimal getHighestMonthlySpend() {
        return highestMonthlySpend;
    }

    public void setHighestMonthlySpend(BigDecimal highestMonthlySpend) {
        this.highestMonthlySpend = highestMonthlySpend;
    }
}