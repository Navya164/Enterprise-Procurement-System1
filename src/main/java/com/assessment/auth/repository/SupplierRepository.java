package com.assessment.auth.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.assessment.auth.entity.Supplier;
import com.assessment.auth.entity.SupplierStatus;
import com.assessment.auth.entity.ComplianceStatus;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    // Check duplicate email
    Optional<Supplier> findByEmail(String email);

    // Check duplicate GST number
    Optional<Supplier> findByGstNumber(String gstNumber);

    // Search by supplier name
    List<Supplier> findBySupplierNameContainingIgnoreCase(String supplierName);

    // Search by company name
    List<Supplier> findByCompanyNameContainingIgnoreCase(String companyName);

    // Search by status
    List<Supplier> findBySupplierStatus(SupplierStatus supplierStatus);

    // Search by compliance status
    List<Supplier> findByComplianceStatus(ComplianceStatus complianceStatus);

    // Check if email already exists
    boolean existsByEmail(String email);

    // Check if GST already exists
    boolean existsByGstNumber(String gstNumber);
}