package com.pms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * User who performed the action.
     */
    @Column(name = "username", length = 150)
    private String username;

    /*
     * HTTP method such as GET, POST, PUT, PATCH, DELETE.
     */
    @Column(name = "http_method", length = 20)
    private String httpMethod;

    /*
     * Action performed by the user.
     */
    @Column(name = "action", length = 200)
    private String action;

    /*
     * Module/controller where the action happened.
     */
    @Column(name = "module", length = 150)
    private String module;

    /*
     * API endpoint that was called.
     */
    @Column(name = "api_endpoint", length = 500)
    private String apiEndpoint;

    /*
     * SUCCESS or FAILED.
     */
    @Column(name = "result", length = 20)
    private String result;

    /*
     * Additional information.
     */
    @Column(name = "details", length = 1000)
    private String details;

    /*
     * IP address of the user/client.
     */
    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    /*
     * When the activity happened.
     */
    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {

        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }

        if (result == null) {
            result = "SUCCESS";
        }
    }

    public AuditLog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getHttpMethod() {
        return httpMethod;
    }

    public void setHttpMethod(String httpMethod) {
        this.httpMethod = httpMethod;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public String getApiEndpoint() {
        return apiEndpoint;
    }

    public void setApiEndpoint(String apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}