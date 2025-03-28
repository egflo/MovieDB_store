package com.movie_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.movie_service.DTO.BookmarkRequest;
import com.movie_service.DTO.Response;
import com.movie_service.service.BookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/bookmark")
public class BookmarkController {
    @Autowired
    private BookmarkService service;

    @DeleteMapping("/movie/{id}/user/{userId}")
    public ResponseEntity<?> deleteBookmark(@PathVariable String id, @PathVariable String userId) {
        service.deleteBookmarkByMovieIdAndUserId(id, userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

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
            @RequestHeader HttpHeaders headers,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction
    ) {

        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();


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



    @GetMapping("/movie/{id}")
    public ResponseEntity<?> getBookmarkByMovieId(
            @RequestHeader HttpHeaders headers,
            @PathVariable String id
    ) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        System.out.println("token: " + token);

        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        return new ResponseEntity<>(service.getByMovieIdAndUserId(id, subject), HttpStatus.OK);
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader HttpHeaders headers,
            @PathVariable String id
    ) {

        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        System.out.println("token: " + token);

        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        return new ResponseEntity<>(service.getBookmark(id), HttpStatus.OK);
    }

    @PostMapping("/")
    public ResponseEntity<?> create(
            @RequestHeader HttpHeaders headers,
            @RequestBody BookmarkRequest request
            ) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        request.setUserId(subject);

        return new ResponseEntity<>(service.addBookmark(request), HttpStatus.OK);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id
    ) {


        Response response = service.deleteBookmark(id);
        return new ResponseEntity<>(response, response.getStatus());
    }
}
