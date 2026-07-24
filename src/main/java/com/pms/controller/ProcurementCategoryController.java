package pms.controller;


import java.util.List;

import org.springframework.web.bind.annotation.*;

import pms.entity.ProcurementCategory;
import pms.service.ProcurementCategoryService;



@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*")
public class ProcurementCategoryController {


    private final ProcurementCategoryService service;


    public ProcurementCategoryController(
            ProcurementCategoryService service){

        this.service = service;
    }



    @GetMapping
    public List<ProcurementCategory> getCategories(){

        return service.getAllCategories();
    }



    @PostMapping
    public ProcurementCategory createCategory(
            @RequestBody ProcurementCategory category){

        return service.saveCategory(category);
    }



    @GetMapping("/{id}")
    public ProcurementCategory getCategory(
            @PathVariable Long id){

        return service.getCategoryById(id);
    }



    @DeleteMapping("/{id}")
    public String deleteCategory(
            @PathVariable Long id){

        service.deleteCategory(id);

        return "Category deleted successfully";
    }
}