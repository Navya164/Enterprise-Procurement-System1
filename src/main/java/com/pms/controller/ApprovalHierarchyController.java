package pms.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import pms.entity.ApprovalHierarchy;
import pms.service.ApprovalHierarchyService;

@RestController
@RequestMapping("/api/approval-hierarchy")
@CrossOrigin("*")
public class ApprovalHierarchyController {

    private final ApprovalHierarchyService service;

    public ApprovalHierarchyController(ApprovalHierarchyService service) {
        this.service = service;
    }

    @GetMapping
    public List<ApprovalHierarchy> getAllApprovalHierarchies() {
        return service.getAllApprovalHierarchies();
    }

    @GetMapping("/{id}")
    public ApprovalHierarchy getApprovalHierarchyById(@PathVariable Long id) {
        return service.getApprovalHierarchyById(id);
    }

    @PostMapping
    public ApprovalHierarchy createApprovalHierarchy(
            @RequestBody ApprovalHierarchy approvalHierarchy) {
        return service.saveApprovalHierarchy(approvalHierarchy);
    }

    @PutMapping("/{id}")
    public ApprovalHierarchy updateApprovalHierarchy(
            @PathVariable Long id,
            @RequestBody ApprovalHierarchy approvalHierarchy) {
        return service.updateApprovalHierarchy(id, approvalHierarchy);
    }

    @DeleteMapping("/{id}")
    public String deleteApprovalHierarchy(@PathVariable Long id) {
        service.deleteApprovalHierarchy(id);
        return "Approval Hierarchy deleted successfully";
    }
}