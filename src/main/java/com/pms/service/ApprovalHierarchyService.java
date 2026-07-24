package pms.service;

import java.util.List;

import pms.entity.ApprovalHierarchy;

public interface ApprovalHierarchyService {

    List<ApprovalHierarchy> getAllApprovalHierarchies();

    ApprovalHierarchy getApprovalHierarchyById(Long id);

    ApprovalHierarchy saveApprovalHierarchy(ApprovalHierarchy approvalHierarchy);

    ApprovalHierarchy updateApprovalHierarchy(Long id, ApprovalHierarchy approvalHierarchy);

    void deleteApprovalHierarchy(Long id);
}