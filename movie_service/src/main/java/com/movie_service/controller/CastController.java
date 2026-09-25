package com.movie_service.controller;

import com.movie_service.service.AutocompleteService;
import com.movie_service.service.CastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/cast")
public class CastController {
    @Autowired
    private CastService service;

    @Autowired
    private AutocompleteService autocomplete;

    /**
     * Search-box suggestions for people credited in the store's films (see
     * AutocompleteService). Blank text gives an empty list.
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(@RequestParam(defaultValue = "") String q,
                                          @RequestParam Optional<Integer> limit) {
        return ResponseEntity.ok(autocomplete.people(q, limit.orElse(null)));
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {

        System.out.println("limit: " + limit);

        return new ResponseEntity<>(service.findAll(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.findByCastId(id), HttpStatus.OK);
    }

    @GetMapping("/search/{title}")
    public ResponseEntity<?> search(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @PathVariable String title
    ) {
        return new ResponseEntity<>(service.findByName(title, PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortBy.orElse("year"))
        )), HttpStatus.OK);
    }


}
