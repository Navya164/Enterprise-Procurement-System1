package com.pms.dto;

import java.math.BigDecimal;
import java.util.List;

public class ProcurementReportDTO {

    private long totalPOs;

    private long pendingPOs;

    private long inProgressPOs;

    private long completedPOs;

    private long rejectedPOs;

    private BigDecimal totalSpend;

    private List<SpendItem> vendorWiseSpend;

    private List<SpendItem> categoryWiseSpend;

    private List<MonthlySpend> monthlySpend;

    public ProcurementReportDTO() {
    }

    public long getTotalPOs() {
        return totalPOs;
    }

    public void setTotalPOs(long totalPOs) {
        this.totalPOs = totalPOs;
    }

    public long getPendingPOs() {
        return pendingPOs;
    }

    public void setPendingPOs(long pendingPOs) {
        this.pendingPOs = pendingPOs;
    }

    public long getInProgressPOs() {
        return inProgressPOs;
    }

    public void setInProgressPOs(long inProgressPOs) {
        this.inProgressPOs = inProgressPOs;
    }

    public long getCompletedPOs() {
        return completedPOs;
    }

    public void setCompletedPOs(long completedPOs) {
        this.completedPOs = completedPOs;
    }

    public long getRejectedPOs() {
        return rejectedPOs;
    }

    public void setRejectedPOs(long rejectedPOs) {
        this.rejectedPOs = rejectedPOs;
    }

    public BigDecimal getTotalSpend() {
        return totalSpend;
    }

    public void setTotalSpend(BigDecimal totalSpend) {
        this.totalSpend = totalSpend;
    }

    public List<SpendItem> getVendorWiseSpend() {
        return vendorWiseSpend;
    }

    public void setVendorWiseSpend(List<SpendItem> vendorWiseSpend) {
        this.vendorWiseSpend = vendorWiseSpend;
    }

    public List<SpendItem> getCategoryWiseSpend() {
        return categoryWiseSpend;
    }

    public void setCategoryWiseSpend(List<SpendItem> categoryWiseSpend) {
        this.categoryWiseSpend = categoryWiseSpend;
    }

    public List<MonthlySpend> getMonthlySpend() {
        return monthlySpend;
    }

    public void setMonthlySpend(List<MonthlySpend> monthlySpend) {
        this.monthlySpend = monthlySpend;
    }

    public static class SpendItem {

        private String name;
        private BigDecimal amount;

        public SpendItem() {
        }

        public SpendItem(String name, BigDecimal amount) {
            this.name = name;
            this.amount = amount;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }

    public static class MonthlySpend {

        private int year;
        private int month;
        private BigDecimal amount;

        public MonthlySpend() {
        }

        public MonthlySpend(int year, int month, BigDecimal amount) {
            this.year = year;
            this.month = month;
            this.amount = amount;
        }

        public int getYear() {
            return year;
        }

        public void setYear(int year) {
            this.year = year;
        }

        public int getMonth() {
            return month;
        }

        public void setMonth(int month) {
            this.month = month;
        }

        public BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(BigDecimal amount) {
            this.amount = amount;
        }
    }
}