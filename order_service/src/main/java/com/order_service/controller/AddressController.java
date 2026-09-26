package com.order_service.controller;

import com.order_service.dto.AddressDTO;
import com.order_service.service.ShippingService;
import com.order_service.service.ShippingService;
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
@RequestMapping(path="/address")
public class AddressController {

    @Autowired
    private ShippingService addressService;


    @GetMapping("/{id}")
    public @ResponseBody ResponseEntity<?> getAddressById(
            @RequestHeader(value = "uid", required = true) String userId,
            @PathVariable(value = "id") Integer id)
    {
        return ResponseEntity.ok(addressService.getAddress(id, userId));
    }


    @DeleteMapping("/{id}")
    @ResponseBody
    public ResponseEntity<?> deleteAddress(
            @RequestHeader(value = "uid", required = true) String userId,
            @PathVariable(value = "id") Integer id) {

        addressService.deleteAddress(id, userId);
        return new ResponseEntity<>(HttpStatus.OK);
    }



}