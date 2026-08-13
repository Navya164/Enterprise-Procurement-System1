package com.pms.controller;

import com.assessment.auth.dto.ProcurementAnalyticsResponseDTO;
import com.pms.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(
            AnalyticsService analyticsService) {

        this.analyticsService = analyticsService;
    }

    @GetMapping("/procurement")
    public ResponseEntity<ProcurementAnalyticsResponseDTO>
    getProcurementAnalytics() {

        return ResponseEntity.ok(
                analyticsService.getProcurementAnalytics()
        );
    }
}