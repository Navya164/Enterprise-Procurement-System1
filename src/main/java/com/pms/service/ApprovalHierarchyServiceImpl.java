package com.pms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pms.entity.ApprovalHierarchy;
import com.pms.repository.ApprovalHierarchyRepository;

@Service
public class ApprovalHierarchyServiceImpl implements ApprovalHierarchyService {

    private final ApprovalHierarchyRepository repository;

    public ApprovalHierarchyServiceImpl(ApprovalHierarchyRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<ApprovalHierarchy> getAllApprovalHierarchies() {
        return repository.findAll();
    }

    @Override
    public ApprovalHierarchy getApprovalHierarchyById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Override
    public ApprovalHierarchy saveApprovalHierarchy(
            ApprovalHierarchy approvalHierarchy) {

        if (repository.existsByDepartmentAndApprovalLevel(
                approvalHierarchy.getDepartment(),
                approvalHierarchy.getApprovalLevel())) {

            throw new RuntimeException(
                    "Approval level already exists for this department"
            );

        }

        return repository.save(approvalHierarchy);
    }

    @Override
    public ApprovalHierarchy updateApprovalHierarchy(
            Long id,
            ApprovalHierarchy approvalHierarchy) {

        ApprovalHierarchy existing =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Approval hierarchy not found"));

        if ((!existing.getDepartment().equals(approvalHierarchy.getDepartment())
                || !existing.getApprovalLevel().equals(approvalHierarchy.getApprovalLevel()))
                && repository.existsByDepartmentAndApprovalLevel(
                        approvalHierarchy.getDepartment(),
                        approvalHierarchy.getApprovalLevel())) {

            throw new RuntimeException(
                    "Approval level already exists for this department"
            );
        }

        existing.setDepartment(approvalHierarchy.getDepartment());
        existing.setApproverName(approvalHierarchy.getApproverName());
        existing.setApproverRole(approvalHierarchy.getApproverRole());
        existing.setApprovalLevel(approvalHierarchy.getApprovalLevel());

        return repository.save(existing);
    }
    
    @Override
    public void deleteApprovalHierarchy(Long id) {
        repository.deleteById(id);
    }
}