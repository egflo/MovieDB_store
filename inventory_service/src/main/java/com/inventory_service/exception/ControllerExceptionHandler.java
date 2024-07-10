package com.inventory_service.exception;


import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeoutException;


//Return a response entity with the exception message and the status code

class Error {
    private String message;
    Integer status;

    public Error(String message, Integer status) {
        this.message = message;
        this.status = status;
    }

    public Integer getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}

@ControllerAdvice
public class ControllerExceptionHandler {

    @ExceptionHandler({InventoryException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    public ResponseEntity<?> handleInventoryException(InventoryException e) {
        Error response = new Error(e.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler({CallNotPermittedException.class})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public ResponseEntity<?> handleCallNotPermittedException() {

        Error response = new Error("Service Unavailable", HttpStatus.SERVICE_UNAVAILABLE.value());
        return new ResponseEntity<>(response, HttpStatus.SERVICE_UNAVAILABLE);
    }


    @ExceptionHandler({TimeoutException.class})
    @ResponseStatus(HttpStatus.REQUEST_TIMEOUT)
    public ResponseEntity<?> handleTimeoutException() {
        Error response = new Error("Request Timeout", HttpStatus.REQUEST_TIMEOUT.value());
        return new ResponseEntity<>(response, HttpStatus.REQUEST_TIMEOUT);
    }

    @ExceptionHandler(value = {IdNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<?> handleIdNotFoundException(IdNotFoundException e) {
        Error response = new Error(e.getMessage(), HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = {Exception.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<?> handleException(Exception e) {

        Error response = new Error(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = {IllegalArgumentException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<?> handleIllegalArgumentException(IllegalArgumentException e) {

        Error response = new Error(e.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    @ExceptionHandler(value = {NullPointerException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<?> handleNullPointerException(NullPointerException e) {

        Error response = new Error(e.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = {EntityNotFoundException.class})
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<?> handleEntityNotFoundException(EntityNotFoundException e) {

            Error response = new Error(e.getMessage(), HttpStatus.NOT_FOUND.value());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }


}
