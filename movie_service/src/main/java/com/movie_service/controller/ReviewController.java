package com.movie_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.movie_service.DTO.SentimentRequest;
import com.movie_service.service.ReviewService;
import com.movie_service.service.SentimentService;
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
    private SentimentService sentimentService;

    @Autowired
    public ReviewController(ReviewService service, SentimentService sentimentService) {
        this.service = service;
        this.sentimentService = sentimentService;
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        System.out.println("limit: " + limit);

        return new ResponseEntity<>(service.getAllReviews(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.getReview(id), HttpStatus.OK);
    }

    @GetMapping("/search/{title}")
    public ResponseEntity<?> search(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @PathVariable String title
    ) {
        return new ResponseEntity<>(service.findByTitleContainingIgnoreCase(title, PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/movie/{id}")
    public ResponseEntity<?> getByMovieId(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.findByMovieId(id, PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }


}
