package com.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.entity.Supplier;
import com.repository.SupplierRepository;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository repository;

    public Supplier addSupplier(Supplier supplier) {
        return repository.save(supplier);
    }

    public List<Supplier> getAllSuppliers() {
        return repository.findAll();
    }

    public Supplier updateSupplier(Long id, Supplier supplier) {

    Supplier oldSupplier = repository.findById(id).orElseThrow();

    oldSupplier.setSupplierName(supplier.getSupplierName());
    oldSupplier.setEmail(supplier.getEmail());
    oldSupplier.setPhone(supplier.getPhone());
    oldSupplier.setCompanyName(supplier.getCompanyName());
    oldSupplier.setAddress(supplier.getAddress());

    return repository.save(oldSupplier);
   }
    public void deleteSupplier(Long id) {
    repository.deleteById(id);
       }
  
}
























