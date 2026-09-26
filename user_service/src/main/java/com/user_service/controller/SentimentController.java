package com.user_service.controller;

import com.user_service.DTO.SentimentDTO;
import com.user_service.DTO.SentimentRequest;
import com.user_service.exception.IdNotFoundException;
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



    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader("uid") String subject,
            @PathVariable String id
    ) {
        // Only the caller's own; someone else's reads as missing.
        SentimentDTO sentiment = service.getSentiment(id);
        if (!subject.equals(sentiment.getUserId())) {
            throw new IdNotFoundException("Sentiment not found with id: " + id);
        }
        return new ResponseEntity<>(sentiment, HttpStatus.OK);
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
