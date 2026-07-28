package com.pms.service;

import java.util.List;

import com.pms.entity.ApprovalHierarchy;

public interface ApprovalHierarchyService {

    List<ApprovalHierarchy> getAllApprovalHierarchies();

    ApprovalHierarchy getApprovalHierarchyById(Long id);

    ApprovalHierarchy saveApprovalHierarchy(ApprovalHierarchy approvalHierarchy);

    ApprovalHierarchy updateApprovalHierarchy(Long id, ApprovalHierarchy approvalHierarchy);

    void deleteApprovalHierarchy(Long id);
}