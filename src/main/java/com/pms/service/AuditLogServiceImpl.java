package com.pms.service;

import com.pms.entity.AuditLog;
import com.pms.repository.AuditLogRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository) {

        this.auditLogRepository = auditLogRepository;
    }

    @Override
    @Transactional
    public AuditLog save(
            String username,
            String httpMethod,
            String action,
            String module,
            String apiEndpoint,
            String result,
            String details,
            String ipAddress) {

        AuditLog log = new AuditLog();

        /*
         * Store user information.
         */
        log.setUsername(
                username
        );

        /*
         * Store HTTP method.
         */
        log.setHttpMethod(
                httpMethod
        );

        /*
         * Store action performed.
         */
        log.setAction(
                action
        );

        /*
         * Store module/controller name.
         */
        log.setModule(
                module
        );

        /*
         * Store API endpoint.
         */
        log.setApiEndpoint(
                apiEndpoint
        );

        /*
         * Store SUCCESS or FAILED.
         */
        log.setResult(
                result
        );

        /*
         * Store additional information.
         */
        log.setDetails(
                details
        );

        /*
         * Store client IP address.
         */
        log.setIpAddress(
                ipAddress
        );

        return auditLogRepository.save(log);
    }

    @Override
    public List<AuditLog> getAll() {

        return auditLogRepository
                .findAllByOrderByTimestampDesc();
    }

    @Override
    public List<AuditLog> search(String keyword) {

        if (keyword == null ||
                keyword.trim().isEmpty()) {

            return getAll();
        }

        return auditLogRepository.search(
                keyword.trim()
        );
    }

    @Override
    public long getTotalActivities() {

        return auditLogRepository.count();
    }

    @Override
    public long getSuccessfulActivities() {

        return auditLogRepository.countByResult(
                "SUCCESS"
        );
    }

    @Override
    public long getFailedActivities() {

        return auditLogRepository.countByResult(
                "FAILED"
        );
    }
}