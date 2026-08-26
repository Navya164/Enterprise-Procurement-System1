package com.assessment.auth.dto;

public class ProcurementPerformanceDTO {

    private long totalPurchaseOrders;
    private long completedPurchaseOrders;
    private long rejectedPurchaseOrders;
    private long pendingPurchaseOrders;
    private long inProgressPurchaseOrders;
    private double completionRate;
    private double rejectionRate;

    public ProcurementPerformanceDTO() {
    }

    public long getTotalPurchaseOrders() {
        return totalPurchaseOrders;
    }

    public void setTotalPurchaseOrders(long totalPurchaseOrders) {
        this.totalPurchaseOrders = totalPurchaseOrders;
    }

    public long getCompletedPurchaseOrders() {
        return completedPurchaseOrders;
    }

    public void setCompletedPurchaseOrders(long completedPurchaseOrders) {
        this.completedPurchaseOrders = completedPurchaseOrders;
    }

    public long getRejectedPurchaseOrders() {
        return rejectedPurchaseOrders;
    }

    public void setRejectedPurchaseOrders(long rejectedPurchaseOrders) {
        this.rejectedPurchaseOrders = rejectedPurchaseOrders;
    }

    public long getPendingPurchaseOrders() {
        return pendingPurchaseOrders;
    }

    public void setPendingPurchaseOrders(long pendingPurchaseOrders) {
        this.pendingPurchaseOrders = pendingPurchaseOrders;
    }

    public long getInProgressPurchaseOrders() {
        return inProgressPurchaseOrders;
    }

    public void setInProgressPurchaseOrders(long inProgressPurchaseOrders) {
        this.inProgressPurchaseOrders = inProgressPurchaseOrders;
    }

    public double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(double completionRate) {
        this.completionRate = completionRate;
    }

    public double getRejectionRate() {
        return rejectionRate;
    }

    public void setRejectionRate(double rejectionRate) {
        this.rejectionRate = rejectionRate;
    }
}