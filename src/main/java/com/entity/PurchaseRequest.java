package com.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * PLACEHOLDER - REPLACE THIS FILE with your actual, existing PurchaseRequest
 * entity from your Purchase Request module. This minimal version is included
 * only so the Purchase Order module compiles and can be tested standalone.
 *
 * IMPORTANT: If your real entity's primary key field is not "id" (Long),
 * or its status field/enum is named differently, update:
 *   - PurchaseOrderServiceImpl (references purchaseRequest.getStatus())
 *   - PurchaseRequestRepository
 */
@Entity
@Table(name = "purchase_requests")
public class PurchaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requested_item", nullable = false, length = 200)
    private String requestedItem;

    @Column(name = "requested_by", nullable = false, length = 150)
    private String requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private PurchaseRequestStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = PurchaseRequestStatus.PENDING;
        }
    }

    public PurchaseRequest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequestedItem() {
        return requestedItem;
    }

    public void setRequestedItem(String requestedItem) {
        this.requestedItem = requestedItem;
    }

    public String getRequestedBy() {
        return requestedBy;
    }

    public void setRequestedBy(String requestedBy) {
        this.requestedBy = requestedBy;
    }

    public PurchaseRequestStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseRequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
