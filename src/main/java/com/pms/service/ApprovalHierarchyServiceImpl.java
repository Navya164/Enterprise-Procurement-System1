package pms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import pms.entity.ApprovalHierarchy;
import pms.repository.ApprovalHierarchyRepository;
import pms.service.*;

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
    public ApprovalHierarchy saveApprovalHierarchy(ApprovalHierarchy approvalHierarchy) {
        return repository.save(approvalHierarchy);
    }

    @Override
    public ApprovalHierarchy updateApprovalHierarchy(Long id, ApprovalHierarchy approvalHierarchy) {
        approvalHierarchy.setId(id);
        return repository.save(approvalHierarchy);
    }

    @Override
    public void deleteApprovalHierarchy(Long id) {
        repository.deleteById(id);
    }
}