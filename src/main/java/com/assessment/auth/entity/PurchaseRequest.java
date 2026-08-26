package com.assessment.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {

    // =========================================================
    // PRIMARY KEY
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long requestId;


    // =========================================================
    // EMPLOYEE
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonIgnore
    private User employee;


    // =========================================================
    // ASSIGNED MANAGER
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_manager_id")
    @JsonIgnore
    private User assignedManager;


    // =========================================================
    // REQUIRED DATABASE FIELDS
    // =========================================================

    @Column(name = "requested_by", nullable = false)
    private String requestedBy;

    @Column(name = "requested_item", nullable = false)
    private String requestedItem;


    // =========================================================
    // PURCHASE REQUEST DETAILS
    // =========================================================

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "category")
    private String category;


    // =========================================================
    // PRIORITY
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "priority")
    private Priority priority;


    // =========================================================
    // STATUS
    // =========================================================

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;


    // =========================================================
    // WORKFLOW FIELDS
    // =========================================================

    @Column(name = "current_level")
    private String currentLevel;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "decision_time")
    private LocalDateTime decisionTime;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "manager_unavailable_since")
    private LocalDateTime managerUnavailableSince;


    // =========================================================
    // CREATED DATE
    // =========================================================

    @Column(name = "created_date")
    private LocalDateTime createdDate;


    // =========================================================
    // REMARKS
    // =========================================================

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;


    // =========================================================
    // EMERGENCY FLAG
    // =========================================================

    @Column(name = "emergency_flag")
    private Boolean emergencyFlag;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PurchaseRequest() {
    }


    // =========================================================
    // PRE-PERSIST
    // =========================================================

    @PrePersist
    public void prePersist() {

        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }

        if (status == null) {
            status = Status.PENDING_MANAGER;
        }

        if (emergencyFlag == null) {
            emergencyFlag = false;
        }

        if (currentLevel == null) {
            currentLevel = "MANAGER";
        }
    }


    // =========================================================
    // REQUEST ID
    // =========================================================

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }


    // =========================================================
    // EMPLOYEE
    // =========================================================

    @JsonIgnore
    public User getEmployee() {
        return employee;
    }

    public void setEmployee(User employee) {
        this.employee = employee;
    }


    // =========================================================
    // ASSIGNED MANAGER
    // =========================================================

    @JsonIgnore
    public User getAssignedManager() {
        return assignedManager;
    }

    public void setAssignedManager(User assignedManager) {
        this.assignedManager = assignedManager;
    }


    // =========================================================
    // REQUESTED BY
    // =========================================================

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }


    // =========================================================
    // REQUESTED ITEM
    // =========================================================

    public String getRequestedItem() {
        return requestedItem;
    }

    public void setRequestedItem(String requestedItem) {
        this.requestedItem = requestedItem;
    }


    // =========================================================
    // TITLE
    // =========================================================

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    // =========================================================
    // DESCRIPTION
    // =========================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    // =========================================================
    // QUANTITY
    // =========================================================

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }


    // =========================================================
    // AMOUNT
    // =========================================================

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }


    // =========================================================
    // CATEGORY
    // =========================================================

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    // =========================================================
    // PRIORITY
    // =========================================================

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }


    // =========================================================
    // STATUS
    // =========================================================

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }


    // =========================================================
    // CURRENT LEVEL
    // =========================================================

    public String getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(String currentLevel) {
        this.currentLevel = currentLevel;
    }


    // =========================================================
    // APPROVAL DATE
    // =========================================================

    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }

    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }


    // =========================================================
    // PREVIOUS STATUS
    // =========================================================

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }


    // =========================================================
    // DECISION TIME
    // =========================================================

    public LocalDateTime getDecisionTime() {
        return decisionTime;
    }

    public void setDecisionTime(LocalDateTime decisionTime) {
        this.decisionTime = decisionTime;
    }


    // =========================================================
    // EXPIRY DATE
    // =========================================================

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }


    // =========================================================
    // CREATED DATE
    // =========================================================

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }


    // =========================================================
    // MANAGER UNAVAILABLE SINCE
    // =========================================================

    public LocalDateTime getManagerUnavailableSince() {
        return managerUnavailableSince;
    }

    public void setManagerUnavailableSince(
            LocalDateTime managerUnavailableSince) {

        this.managerUnavailableSince = managerUnavailableSince;
    }


    // =========================================================
    // REMARKS
    // =========================================================

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }


    // =========================================================
    // EMERGENCY FLAG
    // =========================================================

    public Boolean getEmergencyFlag() {
        return emergencyFlag;
    }

    public void setEmergencyFlag(Boolean emergencyFlag) {
        this.emergencyFlag = emergencyFlag;
    }
}