package com.movie_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.movie_service.DTO.BookmarkRequest;
import com.movie_service.service.BookmarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.server.resource.authentication.BearerTokenAuthentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/bookmark")
public class BookmarkController {
    @Autowired
    private BookmarkService service;


    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {


        return new ResponseEntity<>(service.findAll(PageRequest.of(
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
            @RequestParam Optional<String> sortBy
    ) {

        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        System.out.println("token: " + token);
        System.out.println("subject: " + subject);


        return new ResponseEntity<>(service.findAllByUserId(subject,PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
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

        return new ResponseEntity<>(service.get(id,subject), HttpStatus.OK);
    }

    @PostMapping("/")
    public ResponseEntity<?> create(
            @RequestHeader HttpHeaders headers,
            @RequestBody BookmarkRequest request
            ) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        BookmarkRequest req = new BookmarkRequest();
        req.setMovieId(request.getMovieId());
        req.setUserId(subject);
        req.setCreated(request.getCreated());

        return new ResponseEntity<>(service.create(req), HttpStatus.OK);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.delete(id), HttpStatus.OK);
    }
}
