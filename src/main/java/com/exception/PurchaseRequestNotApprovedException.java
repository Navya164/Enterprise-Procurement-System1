package com.exception;

/**
 * Thrown when trying to create a Purchase Order from a
 * Purchase Request that isn't approved yet.
 */
public class PurchaseRequestNotApprovedException extends RuntimeException {
    public PurchaseRequestNotApprovedException(String message) {
        super(message);
    }
}
