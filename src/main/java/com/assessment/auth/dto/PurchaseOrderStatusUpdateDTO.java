package com.assessment.auth.dto;

import com.pms.entity.PurchaseOrderStatus;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class PurchaseOrderStatusUpdateDTO {

    @NotNull(message = "status is required")
    private PurchaseOrderStatus status;

    /*
     * Item-wise delivered quantity.
     *
     * Example:
     * {
     *   "101": 5,
     *   "102": 10
     * }
     *
     * 101 = PurchaseOrderItem ID
     * 5   = quantity delivered in this update
     */
    private Map<Long, Integer> deliveredQuantities;

    public PurchaseOrderStatus getStatus() {
        return status;
    }

    public void setStatus(PurchaseOrderStatus status) {
        this.status = status;
    }

    public Map<Long, Integer> getDeliveredQuantities() {
        return deliveredQuantities;
    }

    public void setDeliveredQuantities(
            Map<Long, Integer> deliveredQuantities) {
        this.deliveredQuantities = deliveredQuantities;
    }
}