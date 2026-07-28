package com.pms.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pms.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

}