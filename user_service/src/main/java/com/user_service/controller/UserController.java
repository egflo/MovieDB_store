package com.user_service.controller;

import com.user_service.DTO.AddressRequest;
import com.user_service.DTO.UserRequest;
import com.user_service.models.User;
import com.user_service.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private FirebaseService firebaseService;

    @GetMapping("/")
    public ResponseEntity<?> getUser(@RequestHeader(value = "uid", required = true) String subject) {
        return ResponseEntity.ok(firebaseService.getUser(subject));
    }


}