package com.order_service.exception;

public class AddressException extends RuntimeException {
    public AddressException(String message) {
        super(message);
    }

    public AddressException(String message, Throwable cause) {
        super(message, cause);
    }

    public AddressException(Throwable cause) {
        super(cause);
    }

    public AddressException() {
        super();
    }


}
