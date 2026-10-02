package com.movie_service.controller;

import com.movie_service.exception.IdNotFoundException;
import com.movie_service.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Reviews from other sites, one list per source. {id} is the IMDb id (tt...).
 * Paging as elsewhere: page (from 0), limit (10, at most 50), sortBy and
 * direction (1 = ascending; newest or highest first by default).
 * The old /critic routes (CriticReviewController) still serve Rotten Tomatoes
 * in its stored shape for the apps that haven't moved here yet.
 */
@RestController
@RequestMapping("/reviews")
public class ReviewsController {

    private ReviewService service;

    @Autowired
    public ReviewsController(ReviewService service) {
        this.service = service;
    }

    /** {source}: rt or metacritic. sortBy: date (default) or score. */
    @GetMapping("/critic/{source}/movie/{id}")
    public ResponseEntity<?> getCriticReviews(
            @PathVariable String source,
            @PathVariable String id,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction
    ) {
        return new ResponseEntity<>(service.getCriticReviews(
                source, id, page.orElse(0), limit.orElse(10), sortBy.orElse("date"), sortDirection(direction)
        ), HttpStatus.OK);
    }

    /** {source}: imdb, letterboxd or metacritic. sortBy: date (default), rating, or likes (not metacritic). */
    @GetMapping("/user/{source}/movie/{id}")
    public ResponseEntity<?> getUserReviews(
            @PathVariable String source,
            @PathVariable String id,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction
    ) {
        return new ResponseEntity<>(service.getUserReviews(
                source, id, page.orElse(0), limit.orElse(10), sortBy.orElse("date"), sortDirection(direction)
        ), HttpStatus.OK);
    }

    /** How many reviews the movie has per source, for showing only the tabs with content. */
    @GetMapping("/movie/{id}/counts")
    public ResponseEntity<?> getCounts(@PathVariable String id) {
        return new ResponseEntity<>(service.countReviews(id), HttpStatus.OK);
    }

    private static Sort.Direction sortDirection(Optional<Integer> direction) {
        return direction.filter(d -> d == 1).isPresent() ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    // Errors as {"message": ...}, local to this controller like AdminController's
    // (the service-wide handler is switched off).

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(IdNotFoundException.class)
    public ResponseEntity<Map<String, String>> notFound(IdNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
    }
}
