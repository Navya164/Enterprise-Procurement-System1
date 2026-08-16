package com.assessment.auth.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;

public class PurchaseOrderRequestDTO {

    @NotNull(message = "purchaseRequestId is required")
    private Long purchaseRequestId;

    @NotBlank(message = "vendorName is required")
    private String vendorName;

    @NotBlank(message = "vendorEmail is required")
    @Email(message = "vendorEmail must be a valid email address")
    private String vendorEmail;

    @NotEmpty(message = "At least one item is required")
    @Valid
    private List<PurchaseOrderItemRequestDTO> items;

    @Future(message = "expectedDeliveryDate must be in the future")
    private LocalDate expectedDeliveryDate;

    public Long getPurchaseRequestId() { return purchaseRequestId; }
    public void setPurchaseRequestId(Long purchaseRequestId) { this.purchaseRequestId = purchaseRequestId; }

    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }

    public String getVendorEmail() { return vendorEmail; }
    public void setVendorEmail(String vendorEmail) { this.vendorEmail = vendorEmail; }

    public List<PurchaseOrderItemRequestDTO> getItems() { return items; }
    public void setItems(List<PurchaseOrderItemRequestDTO> items) { this.items = items; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
}