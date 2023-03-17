package com.inventory_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.inventory_service.DTO.CartDTO;
import com.inventory_service.service.CartService;
import jakarta.persistence.*;

import java.util.Date;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.github.resilience4j.bulkhead.annotation.Bulkhead;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;

//https://www.amitph.com/spring-rest-http-header/
@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/")
    public ResponseEntity<?> getCart(@RequestHeader HttpHeaders headers) {
        String token = headers.get("authorization").get(0).split(" ")[1].trim();

        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        return ResponseEntity.ok(cartService.findAllByUserId(subject));
    }

    @PostMapping("/")
    public ResponseEntity<?> addCart(@RequestHeader HttpHeaders headers, @RequestBody CartDTO request) {

        return ResponseEntity.ok(cartService.add(request));
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateCart(@RequestHeader HttpHeaders headers,
                                        @PathVariable Integer id,
                                        @RequestBody CartDTO request) {

        request.setId(id);
        return ResponseEntity.ok(cartService.update(request));
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCart(@RequestHeader HttpHeaders headers,
                                                     @PathVariable Integer id) {

        cartService.delete(id);
        return ResponseEntity.ok().build();
    }



    /**
     *
     *    ADMIN METHODS
     * **/

    @GetMapping("/all")
    public ResponseEntity<?> findAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        return ResponseEntity.ok(cartService.getAll(
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findCartById(
            @PathVariable Integer id) {

          return ResponseEntity.ok(cartService.findById(id));
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<?> findCartByMovieId(
            @PathVariable String id,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy) {


        return ResponseEntity.ok(cartService.findAllByItemId(
                id,
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));
    }

}
