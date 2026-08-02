package com.pms.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.pms.entity.ProcurementCategory;
import com.pms.repository.ProcurementCategoryRepository;


@Service
public class ProcurementCategoryService {


    private final ProcurementCategoryRepository repository;


    public ProcurementCategoryService(
            ProcurementCategoryRepository repository) {

        this.repository = repository;
    }


    public List<ProcurementCategory> getAllCategories(){

        return repository.findAll();
    }


    public ProcurementCategory saveCategory(
            ProcurementCategory category){

        return repository.save(category);
    }


    public ProcurementCategory getCategoryById(Long id){

        return repository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Category not found"));
    }

    public ProcurementCategory updateCategory(
            Long id,
            ProcurementCategory category){

        ProcurementCategory existing =
                repository.findById(id)
                .orElseThrow(() ->
                new RuntimeException("Category not found"));

        existing.setCategoryName(category.getCategoryName());
        existing.setCategoryCode(category.getCategoryCode());
        existing.setDescription(category.getDescription());

        return repository.save(existing);
    }
    
    public void deleteCategory(Long id){

        repository.deleteById(id);
    }
}