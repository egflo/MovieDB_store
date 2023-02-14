package com.inventory_service.controller;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.service.CartService;
import com.inventory_service.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

//https://www.amitph.com/spring-rest-http-header/
@RestController
@RequestMapping("/item")
public class ItemController {

    @Autowired
    private ItemService service;



    @GetMapping("/")
    public ResponseEntity<?> get(@RequestHeader HttpHeaders headers, ItemDTO request) {

        return service.getItem(request);
    }


    @PostMapping("/")
    public ResponseEntity<?> add(@RequestHeader HttpHeaders headers, @RequestBody ItemDTO request) {


        return service.addItem(request);
    }


    @PutMapping("/")
    public ResponseEntity<?> updateCart(@RequestHeader HttpHeaders headers,
                                        @RequestBody ItemDTO request) {


        return service.updateItem(request);
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCart(@RequestHeader HttpHeaders headers,
                                                     @PathVariable String id) {

        return service.delete(id);
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

        return service.getAll(
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        );

    }


}
