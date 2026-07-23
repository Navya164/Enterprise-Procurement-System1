package com.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.entity.ComplianceStatus;
import com.entity.Supplier;
import com.entity.SupplierStatus;

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