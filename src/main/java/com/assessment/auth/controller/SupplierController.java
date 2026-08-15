package com.assessment.auth.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.assessment.auth.dto.SupplierRequestDTO;
import com.assessment.auth.dto.SupplierResponseDTO;
import com.assessment.auth.dto.SupplierStatusUpdateDTO;
import com.assessment.auth.service.SupplierService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/suppliers")
@Validated
public class SupplierController {

    @Autowired
    private SupplierService supplierService;


    // ============================================================
    // ADD SUPPLIER
    // ============================================================

    @PostMapping
    public SupplierResponseDTO addSupplier(
            @Valid @RequestBody SupplierRequestDTO dto) {

        return supplierService.addSupplier(dto);
    }


    // ============================================================
    // GET ALL SUPPLIERS
    // ============================================================

    @GetMapping
    public List<SupplierResponseDTO> getAllSuppliers() {

        return supplierService.getAllSuppliers();
    }


    // ============================================================
    // GET SUPPLIER BY ID
    // ============================================================

    @GetMapping("/{id}")
    public SupplierResponseDTO getSupplierById(
            @PathVariable Long id) {

        return supplierService.getSupplierById(id);
    }


    // ============================================================
    // UPDATE SUPPLIER
    // ============================================================

    @PutMapping("/{id}")
    public SupplierResponseDTO updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequestDTO dto) {

        return supplierService.updateSupplier(id, dto);
    }


    // ============================================================
    // UPDATE SUPPLIER STATUS
    // ============================================================

    @PatchMapping("/{id}/status")
    public SupplierResponseDTO updateSupplierStatus(
            @PathVariable Long id,
            @Valid @RequestBody SupplierStatusUpdateDTO dto) {

        return supplierService.updateSupplierStatus(
                id,
                dto
        );
    }


    // ============================================================
    // DELETE SUPPLIER
    // ============================================================

    @DeleteMapping("/{id}")
    public String deleteSupplier(
            @PathVariable Long id) {

        supplierService.deleteSupplier(id);

        return "Supplier deleted successfully.";
    }
}