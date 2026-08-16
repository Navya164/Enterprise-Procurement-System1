package com.assessment.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee;

    @ManyToOne
    @JoinColumn(name = "assigned_manager_id")
    private User assignedManager;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer quantity;

    private Double amount;

    private String category;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    private Status status;

    private String currentLevel;

    private LocalDateTime approvalDate;

    private String previousStatus;

    private LocalDateTime decisionTime;

    private LocalDateTime expiryDate;

    private LocalDateTime createdDate;

    private LocalDateTime managerUnavailableSince;

    @Column(columnDefinition = "TEXT")
    private String remarks;


    public PurchaseRequest() {
    }

    @PrePersist
    public void prePersist() {
        createdDate = LocalDateTime.now();
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public String getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(String currentLevel) {
        this.currentLevel = currentLevel;
    }

    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }

    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }


    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public User getAssignedManager() {
        return assignedManager;
    }

    public void setAssignedManager(User assignedManager) {
        this.assignedManager = assignedManager;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public LocalDateTime getDecisionTime() {
        return decisionTime;
    }

    public void setDecisionTime(LocalDateTime decisionTime) {
        this.decisionTime = decisionTime;
    }

    public LocalDateTime getManagerUnavailableSince() {
        return managerUnavailableSince;
    }

    public void setManagerUnavailableSince(LocalDateTime managerUnavailableSince) {
        this.managerUnavailableSince = managerUnavailableSince;
    }
}