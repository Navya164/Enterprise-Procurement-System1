package com.assessment.auth.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "suppliers")
public class Supplier {

    // ==========================
    // Basic Information
    // ==========================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Supplier name is required")
    @Column(nullable = false)
    private String supplierName;

    @NotBlank(message = "Company name is required")
    @Column(nullable = false)
    private String companyName;

    @NotBlank(message = "Contact person is required")
    @Column(nullable = false)
    private String contactPerson;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
    @Column(nullable = false)
    private String phone;

    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;

    @NotBlank(message = "GST number is required")
    @Column(nullable = false, unique = true)
    private String gstNumber;

    @NotBlank(message = "Business type is required")
    @Column(nullable = false)
    private String businessType;

    // ==========================
    // Profile Information
    // ==========================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SupplierStatus supplierStatus = SupplierStatus.ACTIVE;

    @Column(nullable = false)
    private LocalDate registrationDate = LocalDate.now();

    private String remarks;

    // ==========================
    // Performance Monitoring
    // ==========================

    @Min(value = 0, message = "Quality score cannot be less than 0")
    @Max(value = 100, message = "Quality score cannot exceed 100")
    private Integer qualityScore = 0;

    @Min(value = 0, message = "Delivery score cannot be less than 0")
    @Max(value = 100, message = "Delivery score cannot exceed 100")
    private Integer deliveryScore = 0;

    @Min(value = 0, message = "Communication score cannot be less than 0")
    @Max(value = 100, message = "Communication score cannot exceed 100")
    private Integer communicationScore = 0;

    private Double overallRating = 0.0;

    private Integer totalOrders = 0;

    // ==========================
    // Compliance Tracking
    // ==========================

    private Boolean gstVerified = false;

    private Boolean isoCertified = false;

    private Boolean licenseValid = false;

    @Enumerated(EnumType.STRING)
    private ComplianceStatus complianceStatus = ComplianceStatus.PENDING;

    private LocalDate lastComplianceCheck;

    // ==========================
    // Getters and Setters
    // ==========================

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