package com.pms.controller;

import com.pms.entity.AuditLog;
import com.pms.service.AuditLogService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/audit-logs")
@CrossOrigin(origins = "http://localhost:3000")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(
            AuditLogService auditLogService) {

        this.auditLogService = auditLogService;
    }

    /*
     * Get all audit activities.
     */
    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllActivities() {

        return ResponseEntity.ok(
                auditLogService.getAll()
        );
    }

    /*
     * Search audit activities.
     */
    @GetMapping("/search")
    public ResponseEntity<List<AuditLog>> searchActivities(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                auditLogService.search(keyword)
        );
    }

    /*
     * Dashboard statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStatistics() {

        Map<String, Long> statistics =
                new HashMap<>();

        statistics.put(
                "totalActivities",
                auditLogService.getTotalActivities()
        );

        statistics.put(
                "successfulActivities",
                auditLogService.getSuccessfulActivities()
        );

        statistics.put(
                "failedActivities",
                auditLogService.getFailedActivities()
        );

        return ResponseEntity.ok(statistics);
    }
}