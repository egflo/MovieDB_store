package com.order_service.exception;

public class FirebaseServiceException extends RuntimeException {
    public FirebaseServiceException(String message) {
        super(message);
    }

    public FirebaseServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    public FirebaseServiceException(Throwable cause) {
        super(cause);
    }

    public FirebaseServiceException() {
        super();
    }
}
