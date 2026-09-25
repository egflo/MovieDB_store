package com.movie_service.controller;


import com.movie_service.service.AutocompleteService;
import com.movie_service.service.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Optional;

@RestController
@RequestMapping("/movie")
public class MovieController {
    /** Votes a film needs to count when results are sorted by rating. */
    private static final int MIN_VOTES_FOR_RATING_SORT = 1000;

    @Autowired
    private MovieService service;

    @Autowired
    private AutocompleteService autocomplete;

    /**
     * Search-box suggestions: a few slim rows ranked by how the title matches
     * (see AutocompleteService). Blank text gives an empty list.
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(@RequestParam(defaultValue = "") String q,
                                          @RequestParam Optional<Integer> limit) {
        return ResponseEntity.ok(autocomplete.movies(q, limit.orElse(null)));
    }


    @GetMapping("/all")
    public ResponseEntity<?> getAll(
            @RequestHeader HttpHeaders headers,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction,
            @RequestParam Optional<String> query,
            @RequestParam Optional<String> genres,
            @RequestParam Optional<String> tags
    ) {

        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        HashMap<String,String[]> filters = new HashMap<>();
        query.ifPresent(s -> filters.put("query", s.split("_")));
        genres.ifPresent(s -> filters.put("genres", s.split("_")));
        tags.ifPresent(s -> filters.put("tags", s.split("_")));
        System.out.println("filters: " + filters);
            return new ResponseEntity<>(service.findMoviesByCriteria(
                    query,
                    filters,
                    PageRequest.of(
                            page.orElse(0),
                            limit.orElse(10),
                            Sort.by(sortDirection, sortBy.orElse("year"))
                    )
            ), HttpStatus.OK);

    }

    @GetMapping({"/search/{title}", "/search"})
    public ResponseEntity<?> search(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction,
            @PathVariable Optional<String> title,
            @RequestParam Optional<String> query,
            @RequestParam Optional<String> genres,
            @RequestParam Optional<String> tags,
            @RequestParam Optional<String> rated,
            @RequestParam Optional<Integer> yearFrom,
            @RequestParam Optional<Integer> yearTo,
            @RequestParam Optional<Integer> priceMin,
            @RequestParam Optional<Integer> priceMax
    ) {
        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        HashMap<String,String[]> filters = new HashMap<>();
        query.ifPresent(s -> filters.put("query", s.split("_")));
        genres.ifPresent(s -> filters.put("genres", s.split("_")));
        tags.ifPresent(s -> filters.put("tags", s.split("_")));
        // Content ratings (G, PG-13, ...): any of the "_"-separated values.
        rated.ifPresent(s -> filters.put("rated", s.split("_")));
        // Inclusive; either end may be left open. The same year twice is one year.
        yearFrom.ifPresent(y -> filters.put("yearFrom", new String[]{String.valueOf(y)}));
        yearTo.ifPresent(y -> filters.put("yearTo", new String[]{String.valueOf(y)}));
        // In cents, inclusive; either end may be left open.
        priceMin.ifPresent(p -> filters.put("priceMin", new String[]{String.valueOf(p)}));
        priceMax.ifPresent(p -> filters.put("priceMax", new String[]{String.valueOf(p)}));
        // Ranking by rating alone put obscure titles with a handful of votes
        // first, so rating sorts only count films with enough votes.
        if (sortBy.filter(s -> s.startsWith("ratings.imdb")).isPresent()) {
            filters.put("minVotes", new String[]{String.valueOf(MIN_VOTES_FOR_RATING_SORT)});
        }
        // Price sorts go through the criteria query too, which breaks ties
        // and leaves out records that can't be listed (see MovieDAO).
        if (sortBy.filter("price"::equals).isPresent()) {
            filters.put("priced", new String[0]);
        }

        if (!filters.isEmpty()) {
            return new ResponseEntity<>(service.findMoviesByCriteria(
                    title,
                    filters,
                    PageRequest.of(
                            page.orElse(0),
                            limit.orElse(10),
                            Sort.by(sortDirection, sortBy.orElse("year"))
                    )
            ), HttpStatus.OK);
        }

        if (title.isPresent()) {
            return new ResponseEntity<>(service.findByTitle(title.get(), PageRequest.of(
                    page.orElse(0),
                    limit.orElse(10),
                    Sort.by(sortDirection, sortBy.orElse("year"))
            )), HttpStatus.OK);
        }

        return new ResponseEntity<>(service.findAll(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortDirection, sortBy.orElse("year"))
        )), HttpStatus.OK);

    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getById(
            @RequestHeader HttpHeaders headers,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.findByMovieId(id), HttpStatus.OK);
    }

    @GetMapping("/cast/{castId}")
    public ResponseEntity<?> getByCastId(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction,
            @PathVariable String castId
    ) {
        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(service.findMovieByCastId(castId
                , PageRequest.of(
                        page.orElse(0),
                        limit.orElse(10),
                        Sort.by(sortDirection, sortBy.orElse("ratings.numVotes"))
                )), HttpStatus.OK);

    }

    @GetMapping("/recommend/{id}")
    public ResponseEntity<?> recommendation(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction,
            @PathVariable String id
    ) {
        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(service.recommendMovies(id, PageRequest.of(
                page.orElse(0),
                limit.orElse(25),
                Sort.by(sortDirection, sortBy.orElse("id"))

        )), HttpStatus.OK);
    }


    @GetMapping("/suggest/{id}")
    public ResponseEntity<?> getSuggestionsByMovieId(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @PathVariable String id
    ) {
        return new ResponseEntity<>(service.getSuggestions(id, PageRequest.of(
                page.orElse(0),
                limit.orElse(25),
                Sort.by(Sort.Direction.DESC, sortBy.orElse("id"))
        )), HttpStatus.OK);
    }


    @GetMapping("/tag/all")
    public ResponseEntity<?> getAllTags() {
        return new ResponseEntity<>(service.getAllTags(), HttpStatus.OK);
    }

    @GetMapping("/tag/{id}")
    public ResponseEntity<?> findByTag(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction,
            @PathVariable Integer id
    ) {
        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(service.getMoviesByTagId(id, PageRequest.of(
                page.orElse(0),
                limit.orElse(25),
                Sort.by(sortDirection, sortBy.orElse("id"))

        )), HttpStatus.OK);
    }

}
