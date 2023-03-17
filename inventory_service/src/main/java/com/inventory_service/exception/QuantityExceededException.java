package com.inventory_service.exception;

public class QuantityExceededException extends RuntimeException {
    public QuantityExceededException(String message) {
        super(message);
    }

    public QuantityExceededException(String message, Throwable cause) {
        super(message, cause);
    }

    public QuantityExceededException(Throwable cause) {
        super(cause);
    }

    public QuantityExceededException() {
        super();
    }


}
