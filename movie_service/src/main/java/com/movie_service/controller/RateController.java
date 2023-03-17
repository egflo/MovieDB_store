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
@RequestMapping("/sentiment")
public class RateController {
    @Autowired
    private SentimentService service;


    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        return new ResponseEntity<>(service.getAllSentiments(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.getSentiment(id), HttpStatus.OK);
    }


    @GetMapping("/object/{id}/user/{userId}")
    public ResponseEntity<?> findByUserIdAndObjectId(
            @PathVariable String id,
            @PathVariable String userId
    ) {
        return new ResponseEntity<>(service.findByUserIdAndObjectId(id, userId), HttpStatus.OK);
    }

    @PostMapping("/rate")
    public ResponseEntity<?> like(
            @RequestHeader("Authorization") String token,
            @RequestBody SentimentRequest request
    ) {
        System.out.println("token: " + token);
        System.out.println("request: " + request);

        DecodedJWT jwt = JWT.decode(token.split(" ")[1].trim());
        String subject = jwt.getSubject();
        request.setUserId(subject);
        return new ResponseEntity<>(service.createSentiment(request), HttpStatus.OK);
    }

}
