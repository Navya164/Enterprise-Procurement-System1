package com.pms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pms.entity.ApprovalHierarchy;

public interface ApprovalHierarchyRepository
        extends JpaRepository<ApprovalHierarchy, Long> {

    boolean existsByDepartmentAndApprovalLevel(
            String department,
            Integer approvalLevel
    );

    List<ApprovalHierarchy> findAllByOrderByApprovalLevelAsc();
    
    Optional<ApprovalHierarchy> findByDepartmentAndApprovalLevel(
            String department,
            Integer approvalLevel
    );

    List<ApprovalHierarchy> findByDepartmentOrderByApprovalLevelAsc(
            String department
    );
}