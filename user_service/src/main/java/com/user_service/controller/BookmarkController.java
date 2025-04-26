package com.user_service.controller;

import com.user_service.DTO.BookmarkRequest;
import com.user_service.DTO.Response;
import com.user_service.service.BookmarkService;
import com.user_service.service.FirebaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/bookmark")
public class BookmarkController {
    @Autowired
    private FirebaseService service;

    @GetMapping("/movie/{id}")
    public ResponseEntity<?> getBookmarkByMovieId(
            @RequestHeader("uid") String subject,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.getByMovieIdAndUserId(id, subject), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader("uid") String subject,
            @PathVariable String id
    ) {

        return new ResponseEntity<>(service.getBookmark(id, subject), HttpStatus.OK);
    }

    @PostMapping("/")
    public ResponseEntity<?> create(
            @RequestHeader("uid") String subject,
            @RequestBody BookmarkRequest request
    ) {
        request.setUserId(subject);
        return new ResponseEntity<>(service.addBookmark(request), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @RequestHeader("uid") String subject,
            @PathVariable String id
    ) {
        service.deleteBookmark(id, subject);
        return new ResponseEntity<>("Bookmark Deleted", HttpStatus.OK);
    }

    @DeleteMapping("/movie/{id}")
    public ResponseEntity<?> deleteBookmark(
            @RequestHeader("uid") String subject,
            @PathVariable String id) {

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestHeader("uid") String subject,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        return new ResponseEntity<>(service.getAllBookmarks(
                subject,
                PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    //TODO: Firestore pagination
    /*
    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        return new ResponseEntity<>(service.getBookmarks(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/")
    public ResponseEntity<?> getAllByUserId(
            @RequestHeader("uid") String subject,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction
    ) {
        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(service.getBookmarksByUserId(subject,PageRequest.of(
                page.orElse(0),
                limit.orElse(25),
                Sort.by(sortDirection, sortBy.orElse("id"))
        )), HttpStatus.OK);
    }

     */

}
