package com.assessment.auth.dto;

public class DashboardDTO {

    private long totalUsers;
    private long totalRequests;
    private long pendingManager;
    private long pendingProcurement;
    private long procurementInProgress;
    private long completed;
    private long rejected;

    public DashboardDTO() {}

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getPendingManager() {
        return pendingManager;
    }

    public void setPendingManager(long pendingManager) {
        this.pendingManager = pendingManager;
    }

    public long getPendingProcurement() {
        return pendingProcurement;
    }

    public void setPendingProcurement(long pendingProcurement) {
        this.pendingProcurement = pendingProcurement;
    }

    public long getProcurementInProgress() {
        return procurementInProgress;
    }

    public void setProcurementInProgress(long procurementInProgress) {
        this.procurementInProgress = procurementInProgress;
    }

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getRejected() {
        return rejected;
    }

    public void setRejected(long rejected) {
        this.rejected = rejected;
    }
}