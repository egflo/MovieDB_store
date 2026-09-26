package com.user_service.controller;

import com.user_service.DTO.UserRequest;
import com.user_service.models.User;
import com.user_service.service.FirebaseService;
import com.user_service.service.SentimentService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

/**
 * Staff endpoints, all under /admin. The gateway lets
 * /user-service/admin/** through only for tokens with the ADMIN role
 * (SecurityConfig ADMIN_PATHS), so an endpoint added here is protected by
 * where it lives. Anything that reads or changes other users' data belongs here.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final FirebaseService firebaseService;
    private final SentimentService sentimentService;

    public AdminController(FirebaseService firebaseService, SentimentService sentimentService) {
        this.firebaseService = firebaseService;
        this.sentimentService = sentimentService;
    }

    // Users (were GET /user, POST /user/create, DELETE /user/{id}).

    @GetMapping("/user")
    public List<User> getAllUsers() throws ExecutionException, InterruptedException {
        return firebaseService.getAllUsers();
    }

    @PostMapping("/user/create")
    public ResponseEntity<?> createUser(@RequestBody UserRequest user) {
        return ResponseEntity.ok(firebaseService.createUser(user));
    }

    @DeleteMapping("/user/{id}")
    public void deleteUser(@PathVariable String id) {
        firebaseService.deleteUser(id);
    }

    // Likes and dislikes (were GET /sentiment/all, /sentiment/object/{id}/user/{userId}).

    @GetMapping("/sentiment/all")
    public ResponseEntity<?> getAllSentiments(@RequestParam Optional<Integer> limit,
                                              @RequestParam Optional<Integer> page,
                                              @RequestParam Optional<String> sortBy) {
        return new ResponseEntity<>(sentimentService.getAllSentiments(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("date"))
        )), HttpStatus.OK);
    }

    @GetMapping("/sentiment/object/{id}/user/{userId}")
    public ResponseEntity<?> findSentiment(@PathVariable String id, @PathVariable String userId) {
        return new ResponseEntity<>(sentimentService.findByUserIdAndObjectId(id, userId), HttpStatus.OK);
    }
}
