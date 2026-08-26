package com.pms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_hierarchy")
public class ApprovalHierarchy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String approverName;

    @Column(nullable = false)
    private Long approverId;

    @Column(nullable = false)
    private String approverRole;

    @Column(nullable = false)
    private Integer approvalLevel;

    public ApprovalHierarchy() {
    }

    public ApprovalHierarchy(Long id, String department, String approverName,
                             String approverRole, Integer approvalLevel) {
        this.id = id;
        this.department = department;
        this.approverName = approverName;
        this.approverRole = approverRole;
        this.approvalLevel = approvalLevel;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getApproverName() {
        return approverName;
    }

    public void setApproverName(String approverName) {
        this.approverName = approverName;
    }

    public String getApproverRole() {
        return approverRole;
    }

    public void setApproverRole(String approverRole) {
        this.approverRole = approverRole;
    }

    public Integer getApprovalLevel() {
        return approvalLevel;
    }

    public void setApprovalLevel(Integer approvalLevel) {
        this.approvalLevel = approvalLevel;
    }

    public Long getApproverId() {
        return approverId;
    }

    public void setApproverId(Long approverId) {
        this.approverId = approverId;
    }
}