package com.inventory_service.controller;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.service.CartService;
import com.inventory_service.service.ItemService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

//https://www.amitph.com/spring-rest-http-header/
@RestController
@RequestMapping("/product")
public class ItemController {

    @Autowired
    private ItemService service;

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@RequestHeader HttpHeaders headers,
                                 @PathVariable String id) {

        return ResponseEntity.ok(service.getItemById(id));
    }

    /** The whole catalogue with prices; public, like GET /{id}. */
    @GetMapping("/all")
    public ResponseEntity<?> findAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        return ResponseEntity.ok(service.getAll(
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(10),
                        Sort.by(sortBy.orElse("id"))
                )
        ));
    }

}
