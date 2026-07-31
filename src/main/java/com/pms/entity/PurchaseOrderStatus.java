package com.pms.entity;

/**
 * Lifecycle states of a Purchase Order.
 * CREATED -> SENT -> ACCEPTED -> SHIPPED -> DELIVERED -> CLOSED
 *                                                    \-> CANCELLED
 */
public enum PurchaseOrderStatus {
    CREATED,
    SENT,
    ACCEPTED,
    SHIPPED,
    DELIVERED,
    CLOSED,
    CANCELLED
}
