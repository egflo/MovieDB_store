package com.inventory_service.exception;

public class InventoryException extends RuntimeException {
    public InventoryException(String message) {
        super(message);
    }

    public InventoryException(String message, Throwable cause) {
        super(message, cause);
    }

    public InventoryException(Throwable cause) {
        super(cause);
    }

    public InventoryException() {
        super();
    }

    protected InventoryException(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
