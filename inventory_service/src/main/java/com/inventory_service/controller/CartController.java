package com.inventory_service.controller;

import com.inventory_service.DTO.CartRequest;
import com.inventory_service.service.CartService;
import jakarta.persistence.*;


import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private CartService cartService;

    @GetMapping("/")
    public ResponseEntity<?> getCart(@RequestHeader(value = "uid", required = true) String subject) {
        //String token = headers.get("authorization").get(0).split(" ")[1].trim();
        //DecodedJWT jwt = JWT.decode(token);
        //String subject = jwt.getSubject();
        return ResponseEntity.ok(cartService.findAllByUserId(subject));
    }

    @PostMapping("/")
    public ResponseEntity<?> addCart(@RequestHeader(value = "uid", required = true) String subject, @RequestBody CartRequest request) {
        request.setUserId(subject);
        return ResponseEntity.ok(cartService.add(request));
    }

    @PostMapping("/{id}")
    public ResponseEntity<?> updateCart(@RequestHeader(value = "uid", required = true)
                                            String subject, @PathVariable Integer id,
                                        @RequestBody CartRequest request) {
        request.setId(id);
        request.setUserId(subject);
        return ResponseEntity.ok(cartService.update(request));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCart(@RequestHeader(value = "uid", required = true) String subject,
                                        @PathVariable Integer id) {
        cartService.delete(subject, id);
        return new ResponseEntity<>(HttpStatus.OK);
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
