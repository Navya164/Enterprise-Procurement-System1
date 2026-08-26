package com.pms.repository;

import com.pms.entity.AuditLog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    /*
     * Latest activities first.
     */
    List<AuditLog> findAllByOrderByTimestampDesc();

    /*
     * Count successful activities.
     */
    long countByResult(String result);

    /*
     * Search activities.
     */
    @Query("""
        SELECT a
        FROM AuditLog a
        WHERE
            LOWER(COALESCE(a.username, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(COALESCE(a.action, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(COALESCE(a.module, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(COALESCE(a.apiEndpoint, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
        ORDER BY a.timestamp DESC
    """)
    List<AuditLog> search(String keyword);
}