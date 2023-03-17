package com.order_service.controller;

import com.order_service.dto.AddressDTO;
import com.order_service.service.AddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Controller // This means that this class is a Controller
@RequestMapping(path="/address") // This means URL's start with /demo (after Application path)
public class AddressController {

    @Autowired
    private AddressService addressService;


    @GetMapping("/{id}")
    public @ResponseBody ResponseEntity<?> getAddressById(@PathVariable(value = "id") Integer id)
    {
        return ResponseEntity.ok(addressService.getAddress(id));
    }

    @PostMapping("/")
    @ResponseBody
    public ResponseEntity<?> addAddress(
            @RequestHeader HttpHeaders headers,
            @RequestBody AddressDTO request) {

        return new ResponseEntity<>(addressService.createAddress(request), HttpStatus.CREATED);
    }


    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteAddress(
            @RequestHeader HttpHeaders headers,
            @PathVariable(value = "id") Integer id) {


        addressService.deleteAddress(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }


    /**
     *
     *    ADMIN METHODS
     * **/

    @GetMapping(path="/all")
    public @ResponseBody
    ResponseEntity<?> getAllUsers(
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(addressService.getAllAddresses(
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));
    }

    @GetMapping("/firstname/{fname}")
    public ResponseEntity<?> getAddressByFirstName(
            @PathVariable(value = "fname") String fname,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(addressService.getAddressesByFirstName(
                fname,
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));
    }

    @GetMapping("/lastname/{lname}")
    public ResponseEntity<?> getCustomerByLastName(
            @PathVariable(value = "lname") String lname,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(addressService.getAddressesByLastName(
                lname,
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));
    }

    @GetMapping("/postcode/{postcode}")
    public ResponseEntity<?> getCustomerByPostCode(
            @PathVariable(value = "postcode") String postcode,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy
    ) {
        // This returns a JSON or XML with the movies
        return ResponseEntity.ok(addressService.getAddressesByPostcode(
                postcode,
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(5),
                        Sort.Direction.ASC, sortBy.orElse("id")
                )
        ));
    }


}