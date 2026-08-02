package com.assessment.auth.dto;

import com.pms.entity.PurchaseOrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Dedicated DTO for lifecycle transitions: PATCH /api/purchase-orders/{id}/status
 */
public class PurchaseOrderStatusUpdateDTO {

    @NotNull(message = "status is required")
    private PurchaseOrderStatus status;

    public PurchaseOrderStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseOrderStatus status) {
        this.status = status;
    }
}
