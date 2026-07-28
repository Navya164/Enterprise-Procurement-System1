package com.pms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.pms.entity.Department;
import com.pms.service.DepartmentService;


@RestController
@RequestMapping("/api/departments")
@CrossOrigin("*")
public class DepartmentController {


    private final DepartmentService service;


    public DepartmentController(DepartmentService service) {
        this.service = service;
    }


    @GetMapping
    public List<Department> getAllDepartments(){
        return service.getAllDepartments();
    }


    @PostMapping
    public Department createDepartment(
            @RequestBody Department department){

        return service.saveDepartment(department);
    }


    @GetMapping("/{id}")
    public Department getDepartment(
            @PathVariable Long id){

        return service.getDepartmentById(id);
    }


    @DeleteMapping("/{id}")
    public String deleteDepartment(
            @PathVariable Long id){

        service.deleteDepartment(id);
        return "Department deleted successfully";
    }
}