package com.pms.service;

import com.pms.entity.AuditLog;

import java.util.List;

public interface AuditLogService {

    AuditLog save(
            String username,
            String httpMethod,
            String action,
            String module,
            String apiEndpoint,
            String result,
            String details,
            String ipAddress
    );

    List<AuditLog> getAll();

    List<AuditLog> search(String keyword);

    long getTotalActivities();

    long getSuccessfulActivities();

    long getFailedActivities();
}