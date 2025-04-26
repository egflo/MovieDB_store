package com.user_service.controller;

import com.user_service.DTO.ReviewRequest;
import com.user_service.models.Review;
import com.user_service.service.ReviewService;
import com.user_service.service.SentimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/review")
public class ReviewController {

    private ReviewService service;

    @Autowired
    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @PostMapping("/")
    public ResponseEntity<?> addReview(
            @RequestHeader("uid") String subject,
            @RequestBody ReviewRequest request
    ) {
        return new ResponseEntity<>(service.createReview(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.getReview(id, userId), HttpStatus.OK);
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> updateReview(
            @RequestHeader("uid") String userId,
            @PathVariable String id,
            @RequestBody ReviewRequest request
    ) {
        return new ResponseEntity<>(service.updateReview(id, request), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(
            @RequestHeader("uid") String userId,
            @PathVariable String id
    ) {
        service.deleteReview(id);
        return new ResponseEntity<>("Review deleted", HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        return new ResponseEntity<>(service.getAllReviews(
                userId,
                PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/search/{title}")
    public ResponseEntity<?> search(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @PathVariable String title
    ) {
        return new ResponseEntity<>(service.findByTitleContainingIgnoreCase(
                title,
                userId,
                PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/movie/{id}")
    public ResponseEntity<?> getByMovieId(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction,
            @PathVariable String id
    ) {

        Sort.Direction dir = direction.orElse(1) == 1 ? Sort.Direction.ASC : Sort.Direction.DESC;

        return new ResponseEntity<>(service.findByMovieId(
                id,
                userId,
                PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(dir, sortBy.orElse("date"))

        )), HttpStatus.OK);
    }


}
