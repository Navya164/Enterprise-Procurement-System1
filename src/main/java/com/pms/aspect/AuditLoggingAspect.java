package com.pms.aspect;

import com.pms.service.AuditLogService;

import jakarta.servlet.http.HttpServletRequest;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditLoggingAspect {

    private final AuditLogService auditLogService;

    private final HttpServletRequest request;

    public AuditLoggingAspect(
            AuditLogService auditLogService,
            HttpServletRequest request) {

        this.auditLogService = auditLogService;
        this.request = request;
    }

    /*
     * Automatically monitors every REST controller.
     *
     * Every REST API call will be recorded in the audit_logs table.
     */
    @Around("@within(org.springframework.web.bind.annotation.RestController)")
    public Object logActivity(
            ProceedingJoinPoint joinPoint)
            throws Throwable {

        /*
         * Do not monitor AuditLogController itself.
         *
         * Otherwise, opening the Activity Monitoring page
         * would create another audit record for fetching
         * the audit records.
         */
        String className =
                joinPoint
                        .getTarget()
                        .getClass()
                        .getSimpleName();

        if ("AuditLogController".equals(className)) {

            return joinPoint.proceed();
        }

        /*
         * Get currently logged-in user.
         */
        String username =
                getCurrentUsername();

        /*
         * HTTP method.
         */
        String httpMethod =
                request.getMethod();

        /*
         * API endpoint.
         */
        String apiEndpoint =
                request.getRequestURI();

        /*
         * Client IP address.
         */
        String ipAddress =
                getClientIpAddress();

        /*
         * Create readable action.
         */
        String action =
                createAction(
                        httpMethod,
                        apiEndpoint
                );

        /*
         * Create module name from controller name.
         */
        String module =
                createModule(className);

        try {

            /*
             * Execute the actual controller/API.
             */
            Object result =
                    joinPoint.proceed();

            /*
             * API execution was successful.
             */
            auditLogService.save(
                    username,
                    httpMethod,
                    action,
                    module,
                    apiEndpoint,
                    "SUCCESS",
                    "API operation completed successfully",
                    ipAddress
            );

            return result;

        } catch (Throwable exception) {

            /*
             * API execution failed.
             */
            auditLogService.save(
                    username,
                    httpMethod,
                    action,
                    module,
                    apiEndpoint,
                    "FAILED",
                    getSafeExceptionMessage(exception),
                    ipAddress
            );

            throw exception;
        }
    }


    /*
     * ============================================================
     * GET CURRENT USERNAME
     * ============================================================
     */
    private String getCurrentUsername() {

        try {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            /*
             * Make sure authentication exists
             * and represents an authenticated user.
             */
            if (authentication != null &&
                    authentication.isAuthenticated() &&
                    authentication.getName() != null &&
                    !authentication.getName().trim().isEmpty()) {

                /*
                 * Ignore Spring Security's anonymous user.
                 */
                if (!"anonymousUser".equalsIgnoreCase(
                        authentication.getName())) {

                    return authentication.getName();
                }
            }

        } catch (Exception ignored) {
        }

        return "SYSTEM";
    }


    /*
     * ============================================================
     * GET CLIENT IP ADDRESS
     * ============================================================
     *
     * First check X-Forwarded-For.
     *
     * If the application is running directly on localhost,
     * request.getRemoteAddr() will normally return:
     *
     * 127.0.0.1
     *
     */
    private String getClientIpAddress() {

        try {

            String forwardedFor =
                    request.getHeader("X-Forwarded-For");

            if (forwardedFor != null &&
                    !forwardedFor.trim().isEmpty()) {

                /*
                 * X-Forwarded-For can contain multiple IPs.
                 * The first one is the original client.
                 */
                return forwardedFor
                        .split(",")[0]
                        .trim();
            }

            String realIp =
                    request.getHeader("X-Real-IP");

            if (realIp != null &&
                    !realIp.trim().isEmpty()) {

                return realIp.trim();
            }

            String remoteAddress =
                    request.getRemoteAddr();

            if (remoteAddress != null &&
                    !remoteAddress.trim().isEmpty()) {

                return remoteAddress;
            }

        } catch (Exception ignored) {
        }

        return "-";
    }


    /*
     * ============================================================
     * CREATE READABLE ACTION
     * ============================================================
     */
    private String createAction(
            String httpMethod,
            String endpoint) {

        String method =
                httpMethod == null
                        ? ""
                        : httpMethod.toUpperCase();

        if ("POST".equals(method)) {

            return "CREATE / " + endpoint;
        }

        if ("PUT".equals(method)) {

            return "UPDATE / " + endpoint;
        }

        if ("PATCH".equals(method)) {

            return "STATUS UPDATE / " + endpoint;
        }

        if ("DELETE".equals(method)) {

            return "DELETE / " + endpoint;
        }

        if ("GET".equals(method)) {

            return "VIEW / " + endpoint;
        }

        return method + " / " + endpoint;
    }


    /*
     * ============================================================
     * CREATE MODULE NAME
     * ============================================================
     */
    private String createModule(
            String controllerName) {

        if (controllerName == null) {

            return "System";
        }

        if (controllerName.endsWith("Controller")) {

            controllerName =
                    controllerName.substring(
                            0,
                            controllerName.length()
                                    - "Controller".length()
                    );
        }

        return controllerName;
    }


    /*
     * ============================================================
     * SAFE EXCEPTION MESSAGE
     * ============================================================
     */
    private String getSafeExceptionMessage(
            Throwable exception) {

        String message =
                exception.getMessage();

        if (message == null ||
                message.trim().isEmpty()) {

            return exception
                    .getClass()
                    .getSimpleName();
        }

        if (message.length() > 900) {

            return message.substring(0, 900);
        }

        return message;
    }
}