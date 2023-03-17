package com.movie_service.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/")
public class Controller {

    @Value("${spring.application.name}")
    private String appName;

    @GetMapping
    public String testService(HttpServletRequest request) {
        System.out.println("I am " + request.getRequestURL().toString());
        return request.getRequestURL().toString();
    }
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return new ResponseEntity<>("OK", HttpStatus.OK);
    }

    @GetMapping("/app")
    public ResponseEntity<String> app() {
        return new ResponseEntity<>(appName, HttpStatus.OK);
    }

}
