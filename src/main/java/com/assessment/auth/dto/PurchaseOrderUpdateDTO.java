package com.assessment.auth.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

public class PurchaseOrderUpdateDTO {

    private String vendorName;

    private String vendorEmail;

    private LocalDate expectedDeliveryDate;

    @NotEmpty(message = "At least one purchase order item is required")
    @Valid
    private List<PurchaseOrderItemRequestDTO> items;

    public String getVendorName() {
        return vendorName;
    }

    public void setVendorName(String vendorName) {
        this.vendorName = vendorName;
    }

    public String getVendorEmail() {
        return vendorEmail;
    }

    public void setVendorEmail(String vendorEmail) {
        this.vendorEmail = vendorEmail;
    }

    public LocalDate getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public List<PurchaseOrderItemRequestDTO> getItems() {
        return items;
    }

    public void setItems(List<PurchaseOrderItemRequestDTO> items) {
        this.items = items;
    }
}