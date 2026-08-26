package com.assessment.auth.dto;

import com.assessment.auth.entity.SupplierStatus;
import jakarta.validation.constraints.NotNull;

public class SupplierStatusUpdateDTO {

    @NotNull(message = "supplierStatus is required")
    private SupplierStatus supplierStatus;

    public SupplierStatus getSupplierStatus() {
        return supplierStatus;
    }

    public void setSupplierStatus(SupplierStatus supplierStatus) {
        this.supplierStatus = supplierStatus;
    }
}