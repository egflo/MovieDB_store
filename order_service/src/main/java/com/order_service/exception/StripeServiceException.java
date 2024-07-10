package com.order_service.exception;

public class StripeServiceException extends RuntimeException {
    public StripeServiceException(String message) {
        super(message);
    }

    public StripeServiceException(String message, Throwable cause) {
        super(message, cause);
    }

    public StripeServiceException(Throwable cause) {
        super(cause);
    }

    public StripeServiceException() {
        super();
    }


}
