package com.user_service.controller;

import com.user_service.DTO.SentimentRequest;
import com.user_service.service.SentimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/sentiment")
public class SentimentController {
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
                Sort.by(sortBy.orElse("date"))
        )), HttpStatus.OK);
    }


    @GetMapping("/object/{id}/user/{userId}")
    public ResponseEntity<?> findByUserIdAndObjectId(
            @PathVariable String id,
            @PathVariable String userId
    ) {
        return new ResponseEntity<>(service.findByUserIdAndObjectId(id, userId), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader("uid") String subject,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.getSentiment(id), HttpStatus.OK);
    }


    @GetMapping("/object/{id}")
    public ResponseEntity<?> findByObjectId(
            @RequestHeader("uid") String subject,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.findByObjectId(subject, id), HttpStatus.OK);
    }

    @PostMapping("/rate")
    public ResponseEntity<?> like(
            @RequestHeader("uid") String subject,
            @RequestBody SentimentRequest request
    ) {
        request.setUserId(subject);
        return new ResponseEntity<>(service.createSentiment(request), HttpStatus.OK);
    }

}
