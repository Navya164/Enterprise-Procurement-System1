package com.dto;

import java.time.LocalDate;

import com.entity.ComplianceStatus;
import com.entity.SupplierStatus;

public class SupplierResponseDTO {

    private Long id;
    private String supplierName;
    private String companyName;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String gstNumber;
    private String businessType;
    private SupplierStatus supplierStatus;
    private LocalDate registrationDate;
    private String remarks;
    private Integer qualityScore;
    private Integer deliveryScore;
    private Integer communicationScore;
    private Double overallRating;
    private Integer totalOrders;
    private Boolean gstVerified;
    private Boolean isoCertified;
    private Boolean licenseValid;
    private ComplianceStatus complianceStatus;
    private LocalDate lastComplianceCheck;

    public SupplierResponseDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getContactPerson() {
        return contactPerson;
    }

    public void setContactPerson(String contactPerson) {
        this.contactPerson = contactPerson;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getGstNumber() {
        return gstNumber;
    }

    public void setGstNumber(String gstNumber) {
        this.gstNumber = gstNumber;
    }

    public String getBusinessType() {
        return businessType;
    }

    public void setBusinessType(String businessType) {
        this.businessType = businessType;
    }

    public SupplierStatus getSupplierStatus() {
        return supplierStatus;
    }

    public void setSupplierStatus(SupplierStatus supplierStatus) {
        this.supplierStatus = supplierStatus;
    }

    public LocalDate getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDate registrationDate) {
        this.registrationDate = registrationDate;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public Integer getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Integer qualityScore) {
        this.qualityScore = qualityScore;
    }

    public Integer getDeliveryScore() {
        return deliveryScore;
    }

    public void setDeliveryScore(Integer deliveryScore) {
        this.deliveryScore = deliveryScore;
    }

    public Integer getCommunicationScore() {
        return communicationScore;
    }

    public void setCommunicationScore(Integer communicationScore) {
        this.communicationScore = communicationScore;
    }

    public Double getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(Double overallRating) {
        this.overallRating = overallRating;
    }

    public Integer getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Integer totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Boolean getGstVerified() {
        return gstVerified;
    }

    public void setGstVerified(Boolean gstVerified) {
        this.gstVerified = gstVerified;
    }

    public Boolean getIsoCertified() {
        return isoCertified;
    }

    public void setIsoCertified(Boolean isoCertified) {
        this.isoCertified = isoCertified;
    }

    public Boolean getLicenseValid() {
        return licenseValid;
    }

    public void setLicenseValid(Boolean licenseValid) {
        this.licenseValid = licenseValid;
    }

    public ComplianceStatus getComplianceStatus() {
        return complianceStatus;
    }

    public void setComplianceStatus(ComplianceStatus complianceStatus) {
        this.complianceStatus = complianceStatus;
    }

    public LocalDate getLastComplianceCheck() {
        return lastComplianceCheck;
    }

    public void setLastComplianceCheck(LocalDate lastComplianceCheck) {
        this.lastComplianceCheck = lastComplianceCheck;
    }
}