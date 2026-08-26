package com.assessment.auth.dto;

import com.pms.entity.PurchaseOrderStatus;
import jakarta.validation.constraints.NotNull;

public class PurchaseOrderStatusUpdateDTO {

    @NotNull(message = "status is required")
    private PurchaseOrderStatus status;

    // Quantity delivered in this update
    private Integer deliveredQuantity;

    public PurchaseOrderStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseOrderStatus status) {
        this.status = status;
    }

    public Integer getDeliveredQuantity() {
        return deliveredQuantity;
    }

    public void setDeliveredQuantity(Integer deliveredQuantity) {
        this.deliveredQuantity = deliveredQuantity;
    }
}