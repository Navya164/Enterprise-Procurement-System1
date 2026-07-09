package com.controller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.entity.Supplier;
import com.service.SupplierService;

@RestController
@RequestMapping("/suppliers")
public class SupplierController {

    @Autowired
    private SupplierService service;

    @PostMapping
    public Supplier addSupplier(@RequestBody Supplier supplier) {
        return service.addSupplier(supplier);
    }

    @GetMapping
    public List<Supplier> getAllSuppliers() {
        return service.getAllSuppliers();
    }
    @PutMapping("/{id}")
    public Supplier updateSupplier(@PathVariable Long id,
            @RequestBody Supplier supplier) {

        return service.updateSupplier(id, supplier);
    }
    @DeleteMapping("/{id}")
    public String deleteSupplier(@PathVariable Long id) {

        service.deleteSupplier(id);
        return "Supplier Deleted Successfully";
    }
}