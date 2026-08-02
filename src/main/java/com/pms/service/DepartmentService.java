package com.pms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pms.entity.Department;
import com.pms.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository repository;

    public DepartmentService(DepartmentRepository repository) {
        this.repository = repository;
    }


    public List<Department> getAllDepartments() {
        return repository.findAll();
    }


    public Department saveDepartment(Department department) {
        return repository.save(department);
    }


    public Department getDepartmentById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }
    
    public Department updateDepartment(
            Long id,
            Department department){

        Department existing =
                repository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Department not found"));

        existing.setDepartmentName(department.getDepartmentName());
        existing.setDepartmentCode(department.getDepartmentCode());
        existing.setDescription(department.getDescription());

        return repository.save(existing);
    }

    public void deleteDepartment(Long id) {
        repository.deleteById(id);
    }
}