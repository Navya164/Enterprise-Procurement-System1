package com.assessment.auth.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalDTO {

    private boolean approved;

    @NotBlank(message = "Remarks are required")
    private String remarks;

    private Long managerId;

    public boolean isApproved() {
        return approved;
    }

    public void setApproved(boolean approved) {
        this.approved = approved;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Long getManagerId() {
        return managerId;
    }

    public void setManagerId(Long managerId) {
        this.managerId = managerId;
    }
}