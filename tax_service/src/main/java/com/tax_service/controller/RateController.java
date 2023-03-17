package com.tax_service.controller;


import com.tax_service.DTO.RateDTO;
import com.tax_service.DTO.TaxDTO;
import com.tax_service.service.RateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller("RateController")
@RequestMapping(path="/rate") // This means URL's start with /demo (after Application path)
public class RateController {

    @Autowired
    private RateService rateService;


    @PostMapping("/")
    @ResponseBody
    public ResponseEntity<?> addRate(
            @RequestHeader HttpHeaders headers,
            @RequestBody RateDTO request) {

        return new ResponseEntity<>(rateService.save(request), HttpStatus.CREATED);
    }

    @PostMapping("/update/tax")
    @ResponseBody
    public ResponseEntity<?> updateTax(
            @RequestHeader HttpHeaders headers,
            @RequestBody TaxDTO request) {

        return new ResponseEntity<>(rateService.updateTax(request), HttpStatus.CREATED);
    }

    @GetMapping(path="/postcode/{postcode}")
    public @ResponseBody
    ResponseEntity<?> getRateByPostcode(
            @PathVariable String postcode) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(rateService.findByPostcode(postcode));
    }

    @GetMapping(path="/state")
    public @ResponseBody
    ResponseEntity<?> getRateByState(
            @RequestParam String state
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(rateService.findByState(state));
    }


    @GetMapping(path="/city/{city}")
    public @ResponseBody
    ResponseEntity<?> getRateByCityPath(
            @PathVariable String city
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(rateService.findRateByCityContainingIgnoreCase(city));
    }

    @GetMapping(path="/city")
    public @ResponseBody
    ResponseEntity<?> getRateByCity(
            @RequestParam String city
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(rateService.findByCity(city));
    }

    @GetMapping(path="/all")
    public @ResponseBody
    ResponseEntity<?> getAll(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(rateService.findAll(
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));
    }
}
