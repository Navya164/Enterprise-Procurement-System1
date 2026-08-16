package com.assessment.auth.dto;

public class DashboardDTO {

    // Existing Purchase Request summary
    private long totalUsers;
    private long totalRequests;
    private long pendingManager;
    private long pendingProcurement;
    private long procurementInProgress;
    private long completed;
    private long rejected;

    // Purchase Order summary (NEW - Task 1 dashboard cards)
    private long totalPOs;
    private long poPending;
    private long poInProgress;
    private long poCompleted;
    private long poRejected;
    private long totalVendors;

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

    // ================= PO fields =================

    public long getTotalPOs() {
        return totalPOs;
    }

    public void setTotalPOs(long totalPOs) {
        this.totalPOs = totalPOs;
    }

    public long getPoPending() {
        return poPending;
    }

    public void setPoPending(long poPending) {
        this.poPending = poPending;
    }

    public long getPoInProgress() {
        return poInProgress;
    }

    public void setPoInProgress(long poInProgress) {
        this.poInProgress = poInProgress;
    }

    public long getPoCompleted() {
        return poCompleted;
    }

    public void setPoCompleted(long poCompleted) {
        this.poCompleted = poCompleted;
    }

    public long getPoRejected() {
        return poRejected;
    }

    public void setPoRejected(long poRejected) {
        this.poRejected = poRejected;
    }

    public long getTotalVendors() {
        return totalVendors;
    }

    public void setTotalVendors(long totalVendors) {
        this.totalVendors = totalVendors;
    }
}