package com.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.entity.Supplier;

public interface SupplierRepository extends JpaRepository<Supplier, Long>{

}