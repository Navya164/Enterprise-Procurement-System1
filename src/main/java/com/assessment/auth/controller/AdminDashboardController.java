package com.assessment.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.assessment.auth.dto.DashboardDTO;
import com.assessment.auth.service.DashboardService;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {
	
	  @GetMapping("/test")
	    public String test() {
	        return "Admin Controller Working";
	    }

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    public DashboardDTO getDashboard() {
        return dashboardService.getDashboardData();
    }
    
  
}