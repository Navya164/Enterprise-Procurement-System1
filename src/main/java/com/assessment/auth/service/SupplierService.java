package com.assessment.auth.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.assessment.auth.dto.SupplierRequestDTO;
import com.assessment.auth.dto.SupplierResponseDTO;
import com.assessment.auth.dto.SupplierStatusUpdateDTO;
import com.assessment.auth.entity.ComplianceStatus;
import com.assessment.auth.entity.Supplier;
import com.assessment.auth.entity.SupplierStatus;
import com.assessment.auth.exception.ActiveSupplierDeletionException;
import com.assessment.auth.exception.DuplicateSupplierException;
import com.assessment.auth.exception.SupplierNotFoundException;
import com.assessment.auth.mapper.SupplierMapper;
import com.assessment.auth.repository.SupplierRepository;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository repository;


    // ============================================================
    // ADD SUPPLIER
    // ============================================================

    public SupplierResponseDTO addSupplier(
            SupplierRequestDTO dto) {

        if (repository.existsByEmail(dto.getEmail())) {
            throw new DuplicateSupplierException(
                    "Email already exists."
            );
        }

        if (repository.existsByGstNumber(dto.getGstNumber())) {
            throw new DuplicateSupplierException(
                    "GST Number already exists."
            );
        }

        Supplier supplier =
                SupplierMapper.toEntity(dto);

        supplier.setRegistrationDate(
                LocalDate.now()
        );

        supplier.setOverallRating(
                calculateOverallRating(supplier)
        );

        supplier.setComplianceStatus(
                calculateComplianceStatus(supplier)
        );

        supplier.setLastComplianceCheck(
                LocalDate.now()
        );

        return SupplierMapper.toDTO(
                repository.save(supplier)
        );
    }


    // ============================================================
    // GET ALL SUPPLIERS
    // ============================================================

    public List<SupplierResponseDTO> getAllSuppliers() {

        return repository.findAll()
                .stream()
                .map(SupplierMapper::toDTO)
                .collect(Collectors.toList());
    }


    // ============================================================
    // GET SUPPLIER BY ID
    // ============================================================

    public SupplierResponseDTO getSupplierById(Long id) {

        Supplier supplier =
                repository.findById(id)
                        .orElseThrow(
                                () -> new SupplierNotFoundException(
                                        "Supplier not found with ID : "
                                                + id
                                )
                        );

        return SupplierMapper.toDTO(supplier);
    }


    // ============================================================
    // UPDATE SUPPLIER
    // ============================================================

    public SupplierResponseDTO updateSupplier(
            Long id,
            SupplierRequestDTO dto) {

        Supplier supplier =
                repository.findById(id)
                        .orElseThrow(
                                () -> new SupplierNotFoundException(
                                        "Supplier not found with ID : "
                                                + id
                                )
                        );

        supplier.setSupplierName(
                dto.getSupplierName()
        );

        supplier.setCompanyName(
                dto.getCompanyName()
        );

        supplier.setContactPerson(
                dto.getContactPerson()
        );

        supplier.setEmail(
                dto.getEmail()
        );

        supplier.setPhone(
                dto.getPhone()
        );

        supplier.setAddress(
                dto.getAddress()
        );

        supplier.setGstNumber(
                dto.getGstNumber()
        );

        supplier.setBusinessType(
                dto.getBusinessType()
        );

        supplier.setSupplierStatus(
                dto.getSupplierStatus() == null
                        ? SupplierStatus.ACTIVE
                        : dto.getSupplierStatus()
        );

        supplier.setRemarks(
                dto.getRemarks()
        );

        supplier.setQualityScore(
                dto.getQualityScore()
        );

        supplier.setDeliveryScore(
                dto.getDeliveryScore()
        );

        supplier.setCommunicationScore(
                dto.getCommunicationScore()
        );

        supplier.setTotalOrders(
                dto.getTotalOrders()
        );

        supplier.setGstVerified(
                dto.getGstVerified()
        );

        supplier.setIsoCertified(
                dto.getIsoCertified()
        );

        supplier.setLicenseValid(
                dto.getLicenseValid()
        );

        supplier.setOverallRating(
                calculateOverallRating(supplier)
        );

        supplier.setComplianceStatus(
                calculateComplianceStatus(supplier)
        );

        supplier.setLastComplianceCheck(
                LocalDate.now()
        );

        return SupplierMapper.toDTO(
                repository.save(supplier)
        );
    }


    // ============================================================
    // UPDATE SUPPLIER STATUS
    // ============================================================

    public SupplierResponseDTO updateSupplierStatus(
            Long id,
            SupplierStatusUpdateDTO dto) {

        Supplier supplier =
                repository.findById(id)
                        .orElseThrow(
                                () -> new SupplierNotFoundException(
                                        "Supplier not found with ID : "
                                                + id
                                )
                        );

        supplier.setSupplierStatus(
                dto.getSupplierStatus()
        );

        return SupplierMapper.toDTO(
                repository.save(supplier)
        );
    }


    // ============================================================
    // DELETE SUPPLIER
    // ============================================================

    public void deleteSupplier(Long id) {

        Supplier supplier =
                repository.findById(id)
                        .orElseThrow(
                                () -> new SupplierNotFoundException(
                                        "Supplier not found with ID : "
                                                + id
                                )
                        );

        if (supplier.getSupplierStatus()
                == SupplierStatus.ACTIVE) {

            throw new ActiveSupplierDeletionException(
                    "Active suppliers cannot be deleted."
            );
        }

        repository.delete(supplier);
    }


    // ============================================================
    // CALCULATE OVERALL RATING
    // ============================================================

    private Double calculateOverallRating(
            Supplier supplier) {

        return (
                supplier.getQualityScore()
                        + supplier.getDeliveryScore()
                        + supplier.getCommunicationScore()
        ) / 60.0;
    }


    // ============================================================
    // CALCULATE COMPLIANCE STATUS
    // ============================================================

    private ComplianceStatus calculateComplianceStatus(
            Supplier supplier) {

        return (
                Boolean.TRUE.equals(
                        supplier.getGstVerified()
                )
                &&
                Boolean.TRUE.equals(
                        supplier.getIsoCertified()
                )
                &&
                Boolean.TRUE.equals(
                        supplier.getLicenseValid()
                )
        )
                ? ComplianceStatus.COMPLIANT
                : ComplianceStatus.NON_COMPLIANT;
    }
}