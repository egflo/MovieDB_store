package com.order_service.controller;

import com.order_service.dto.AddressDTO;
import com.order_service.service.OrderService;
import com.order_service.service.ShippingService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Staff endpoints, all under /admin. The gateway lets
 * /order-service/admin/** through only for tokens with the ADMIN role
 * (SecurityConfig ADMIN_PATHS), so an endpoint added here is protected by
 * where it lives. Anything that reads or changes other users' data belongs here.
 */
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final OrderService orderService;
    private final ShippingService shippingService;

    public AdminController(OrderService orderService, ShippingService shippingService) {
        this.orderService = orderService;
        this.shippingService = shippingService;
    }

    /** Every user's orders (was GET /all). */
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(@RequestParam Optional<Integer> limit,
                                          @RequestParam Optional<Integer> page,
                                          @RequestParam Optional<String> sortBy,
                                          @RequestParam Optional<Integer> direction) {
        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(orderService.getAllOrders(PageRequest.of(
                page.orElse(0),
                limit.orElse(10),
                Sort.by(sortDirection, sortBy.orElse("id"))
        )), HttpStatus.OK);
    }

    // Orders' shipping addresses (were GET /address/all, /address/firstname/...).

    @GetMapping("/address/all")
    public ResponseEntity<?> getAllAddresses(@RequestParam Optional<Integer> limit,
                                             @RequestParam Optional<Integer> page,
                                             @RequestParam Optional<String> sortBy) {
        return ResponseEntity.ok(shippingService.getAllAddresses(pageOf(limit, page, sortBy)));
    }

    @GetMapping("/address/firstname/{fname}")
    public ResponseEntity<?> getAddressesByFirstName(@PathVariable(value = "fname") String fname,
                                                     @RequestParam Optional<Integer> limit,
                                                     @RequestParam Optional<Integer> page,
                                                     @RequestParam Optional<String> sortBy) {
        return ResponseEntity.ok(shippingService.getAddressesByFirstName(fname, pageOf(limit, page, sortBy)));
    }

    @GetMapping("/address/lastname/{lname}")
    public ResponseEntity<?> getAddressesByLastName(@PathVariable(value = "lname") String lname,
                                                    @RequestParam Optional<Integer> limit,
                                                    @RequestParam Optional<Integer> page,
                                                    @RequestParam Optional<String> sortBy) {
        return ResponseEntity.ok(shippingService.getAddressesByLastName(lname, pageOf(limit, page, sortBy)));
    }

    @GetMapping("/address/postcode/{postcode}")
    public ResponseEntity<?> getAddressesByPostcode(@PathVariable(value = "postcode") String postcode,
                                                    @RequestParam Optional<Integer> limit,
                                                    @RequestParam Optional<Integer> page,
                                                    @RequestParam Optional<String> sortBy) {
        return ResponseEntity.ok(shippingService.getAddressesByPostcode(postcode, pageOf(limit, page, sortBy)));
    }

    /** Was POST /address/. Creates a shipping row not attached to any order. */
    @PostMapping("/address/")
    public ResponseEntity<?> addAddress(@RequestBody AddressDTO request) {
        return new ResponseEntity<>(shippingService.createAddress(request), HttpStatus.CREATED);
    }

    private static PageRequest pageOf(Optional<Integer> limit, Optional<Integer> page, Optional<String> sortBy) {
        return PageRequest.of(page.orElse(0), limit.orElse(5), Sort.Direction.ASC, sortBy.orElse("id"));
    }
}
