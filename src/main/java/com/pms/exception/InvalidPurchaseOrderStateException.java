package com.pms.exception;

/**
 * Thrown when an invalid lifecycle transition is attempted,
 * e.g., trying to move from DELIVERED back to SENT.
 */
public class InvalidPurchaseOrderStateException extends RuntimeException {
    public InvalidPurchaseOrderStateException(String message) {
        super(message);
    }
}
