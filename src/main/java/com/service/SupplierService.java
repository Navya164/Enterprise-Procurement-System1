package com.service;

// DTO-based SupplierService
// (See chat for integration details.)

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dto.SupplierRequestDTO;
import com.dto.SupplierResponseDTO;
import com.entity.*;
import com.exception.*;
import com.mapper.SupplierMapper;
import com.repository.SupplierRepository;

@Service
public class SupplierService {
 @Autowired
 private SupplierRepository repository;

 public SupplierResponseDTO addSupplier(SupplierRequestDTO dto){
  if(repository.existsByEmail(dto.getEmail())) throw new DuplicateSupplierException("Email already exists.");
  if(repository.existsByGstNumber(dto.getGstNumber())) throw new DuplicateSupplierException("GST Number already exists.");
  Supplier supplier=SupplierMapper.toEntity(dto);
  supplier.setRegistrationDate(LocalDate.now());
  supplier.setOverallRating(calculateOverallRating(supplier));
  supplier.setComplianceStatus(calculateComplianceStatus(supplier));
  supplier.setLastComplianceCheck(LocalDate.now());
  return SupplierMapper.toDTO(repository.save(supplier));
 }

 public List<SupplierResponseDTO> getAllSuppliers(){
  return repository.findAll().stream().map(SupplierMapper::toDTO).collect(Collectors.toList());
 }

 public SupplierResponseDTO getSupplierById(Long id){
  Supplier supplier=repository.findById(id).orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID : "+id));
  return SupplierMapper.toDTO(supplier);
 }

 public SupplierResponseDTO updateSupplier(Long id,SupplierRequestDTO dto){
  Supplier supplier=repository.findById(id).orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID : "+id));
  supplier.setSupplierName(dto.getSupplierName());
  supplier.setCompanyName(dto.getCompanyName());
  supplier.setContactPerson(dto.getContactPerson());
  supplier.setEmail(dto.getEmail());
  supplier.setPhone(dto.getPhone());
  supplier.setAddress(dto.getAddress());
  supplier.setGstNumber(dto.getGstNumber());
  supplier.setBusinessType(dto.getBusinessType());
  supplier.setSupplierStatus(dto.getSupplierStatus()==null?SupplierStatus.ACTIVE:dto.getSupplierStatus());
  supplier.setRemarks(dto.getRemarks());
  supplier.setQualityScore(dto.getQualityScore());
  supplier.setDeliveryScore(dto.getDeliveryScore());
  supplier.setCommunicationScore(dto.getCommunicationScore());
  supplier.setTotalOrders(dto.getTotalOrders());
  supplier.setGstVerified(dto.getGstVerified());
  supplier.setIsoCertified(dto.getIsoCertified());
  supplier.setLicenseValid(dto.getLicenseValid());
  supplier.setOverallRating(calculateOverallRating(supplier));
  supplier.setComplianceStatus(calculateComplianceStatus(supplier));
  supplier.setLastComplianceCheck(LocalDate.now());
  return SupplierMapper.toDTO(repository.save(supplier));
 }

 public void deleteSupplier(Long id){
  Supplier supplier=repository.findById(id).orElseThrow(() -> new SupplierNotFoundException("Supplier not found with ID : "+id));
  if(supplier.getSupplierStatus()==SupplierStatus.ACTIVE) throw new ActiveSupplierDeletionException("Active suppliers cannot be deleted.");
  repository.delete(supplier);
 }

 private Double calculateOverallRating(Supplier s){
  return (s.getQualityScore()+s.getDeliveryScore()+s.getCommunicationScore())/60.0;
 }

 private ComplianceStatus calculateComplianceStatus(Supplier s){
  return (Boolean.TRUE.equals(s.getGstVerified())&&Boolean.TRUE.equals(s.getIsoCertified())&&Boolean.TRUE.equals(s.getLicenseValid()))?ComplianceStatus.COMPLIANT:ComplianceStatus.NON_COMPLIANT;
 }
}
