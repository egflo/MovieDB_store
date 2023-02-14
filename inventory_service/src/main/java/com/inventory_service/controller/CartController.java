package com.inventory_service.controller;

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

//https://www.amitph.com/spring-rest-http-header/
@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;



    @GetMapping("/user/{id}")
    public ResponseEntity<?> getCart(@RequestHeader HttpHeaders headers
            , @PathVariable String id) {

        return cartService.getCartByUserId(id);
    }

    @PostMapping("/")
    public ResponseEntity<?> addCart(@RequestHeader HttpHeaders headers, @RequestBody CartDTO request) {


        return cartService.addItem(request);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateCart(@RequestHeader HttpHeaders headers,
                                        @PathVariable Integer id,
                                        @RequestBody CartDTO request) {

        request.setId(id);
        return cartService.updateItem(request);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCart(@RequestHeader HttpHeaders headers,
                                                     @PathVariable Integer id) {

        CartDTO request = new CartDTO();
        request.setId(id);

        return cartService.removeItem(request);
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

        return cartService.getAll(
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        );

    }

    @GetMapping("/{id}")
    public ResponseEntity<?> findCartById(
            @PathVariable Integer id) {

        CartDTO request = new CartDTO();
        request.setId(id);

        return cartService.getCart(request);
    }

    @GetMapping("/item/{id}")
    public ResponseEntity<?> findCartByMovieId(
            @PathVariable String id,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy) {


        return cartService.findAllByItemId(id,
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        );
    }

}
