package com.assessment.auth.mapper;

import com.assessment.auth.dto.SupplierRequestDTO;
import com.assessment.auth.dto.SupplierResponseDTO;
import com.assessment.auth.entity.Supplier;

public class SupplierMapper {

    // Convert Request DTO -> Entity
    public static Supplier toEntity(SupplierRequestDTO dto) {

        Supplier supplier = new Supplier();

        supplier.setSupplierName(dto.getSupplierName());
        supplier.setCompanyName(dto.getCompanyName());
        supplier.setContactPerson(dto.getContactPerson());
        supplier.setEmail(dto.getEmail());
        supplier.setPhone(dto.getPhone());
        supplier.setAddress(dto.getAddress());
        supplier.setGstNumber(dto.getGstNumber());
        supplier.setBusinessType(dto.getBusinessType());

        supplier.setSupplierStatus(dto.getSupplierStatus());
        supplier.setRemarks(dto.getRemarks());

        supplier.setQualityScore(dto.getQualityScore());
        supplier.setDeliveryScore(dto.getDeliveryScore());
        supplier.setCommunicationScore(dto.getCommunicationScore());

        supplier.setTotalOrders(dto.getTotalOrders());

        supplier.setGstVerified(dto.getGstVerified());
        supplier.setIsoCertified(dto.getIsoCertified());
        supplier.setLicenseValid(dto.getLicenseValid());

        supplier.setComplianceStatus(dto.getComplianceStatus());

        return supplier;
    }

    // Convert Entity -> Response DTO
    public static SupplierResponseDTO toDTO(Supplier supplier) {

        SupplierResponseDTO dto = new SupplierResponseDTO();

        dto.setId(supplier.getId());

        dto.setSupplierName(supplier.getSupplierName());
        dto.setCompanyName(supplier.getCompanyName());
        dto.setContactPerson(supplier.getContactPerson());

        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());

        dto.setAddress(supplier.getAddress());

        dto.setGstNumber(supplier.getGstNumber());

        dto.setBusinessType(supplier.getBusinessType());

        dto.setSupplierStatus(supplier.getSupplierStatus());

        dto.setRegistrationDate(supplier.getRegistrationDate());

        dto.setRemarks(supplier.getRemarks());

        dto.setQualityScore(supplier.getQualityScore());
        dto.setDeliveryScore(supplier.getDeliveryScore());
        dto.setCommunicationScore(supplier.getCommunicationScore());

        dto.setOverallRating(supplier.getOverallRating());

        dto.setTotalOrders(supplier.getTotalOrders());

        dto.setGstVerified(supplier.getGstVerified());
        dto.setIsoCertified(supplier.getIsoCertified());
        dto.setLicenseValid(supplier.getLicenseValid());

        dto.setComplianceStatus(supplier.getComplianceStatus());

        dto.setLastComplianceCheck(supplier.getLastComplianceCheck());

        return dto;
    }
}