package com.movie_service.controller;

import com.movie_service.DTO.MovieRequest;
import com.movie_service.exception.DuplicateException;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.service.MovieAdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin-only movie writes. The gateway requires the ADMIN role for
 * /movie-service/admin/** (SecurityConfig.ADMIN_PATHS), and the service only
 * listens on 127.0.0.1, so nothing else reaches these.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final MovieAdminService movies;

    public AdminController(MovieAdminService movies) {
        this.movies = movies;
    }

    /** New movie; 409 if the IMDb id is taken. Its price and stock go to inventory separately. */
    @PostMapping("/movie")
    public ResponseEntity<?> createMovie(@RequestBody MovieRequest request) {
        return new ResponseEntity<>(movies.create(request), HttpStatus.CREATED);
    }

    /** Replaces the editable fields (see MovieRequest); the IMDb id stays as it is. */
    @PutMapping("/movie/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable String id, @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movies.update(id, request));
    }

    // Errors as {"message": ...} with a real status. Local to this controller:
    // the service-wide ControllerExceptionHandler is switched off (its
    // @ControllerAdvice is commented out), and turning it on would change the
    // status codes of every public endpoint.

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) {
        return error(HttpStatus.BAD_REQUEST, e.getMessage());
    }

    @ExceptionHandler(DuplicateException.class)
    public ResponseEntity<Map<String, String>> conflict(DuplicateException e) {
        return error(HttpStatus.CONFLICT, e.getMessage());
    }

    @ExceptionHandler(IdNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(IdNotFoundException e) {
        return error(HttpStatus.NOT_FOUND, e.getMessage());
    }

    private static ResponseEntity<Map<String, String>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message == null ? status.getReasonPhrase() : message));
    }
}
