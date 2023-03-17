package com.order_service.controller;


import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.order_service.request.PaymentIntentRequest;
import com.order_service.request.OrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.order_service.service.OrderService;

import java.util.Optional;

@RestController
public class OrderController {
    OrderService orderService;

    @Autowired
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }


    @GetMapping("/checkout")
    public @ResponseBody ResponseEntity<?>
    getCheckout(@RequestHeader HttpHeaders headers, @RequestParam String postalCode) {

            String token = headers.get("authorization").get(0).split(" ")[1].trim();
            DecodedJWT jwt = JWT.decode(token);
            String subject = jwt.getSubject();

            return new ResponseEntity<>(orderService.getCheckout(subject,postalCode), HttpStatus.OK);

    }

    @GetMapping("/checkout/{id}")
    public @ResponseBody ResponseEntity<?>
    checkout(
            @RequestHeader HttpHeaders headers,
            @PathVariable(value = "id") String id, @RequestParam String postalCode) {

        return new ResponseEntity<>(orderService.getCheckout(id,postalCode), HttpStatus.OK);
    }

    @PostMapping("/charge")
    public @ResponseBody ResponseEntity<?> createCharge(@RequestBody PaymentIntentRequest request) {

        return new ResponseEntity<>(orderService.createPaymentIntent(request), HttpStatus.CREATED);
    }

    @PostMapping("/")
    public @ResponseBody ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {

        return new ResponseEntity<>(orderService.createOrder(orderRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public @ResponseBody ResponseEntity<?> getOrder(@PathVariable(value = "id") Integer id) {
        return new ResponseEntity<>(orderService.getOrder(id), HttpStatus.OK);
    }

    @GetMapping("/user/")
    public @ResponseBody ResponseEntity<?> getOrderByUserId(
            @RequestHeader HttpHeaders headers,
                                                            @RequestParam Optional<Integer> limit,
                                                            @RequestParam Optional<Integer> page,
                                                            @RequestParam Optional<String> sortBy,
                                                            @RequestParam Optional<Integer> direction) {


        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();


        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(orderService.getOrdersByUserId(subject,
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(10),
                        Sort.by(sortDirection, sortBy.orElse("id"))
                )), HttpStatus.OK);
    }


    @GetMapping("/all")
    public @ResponseBody ResponseEntity<?> getAllOrders(    @RequestParam Optional<Integer> limit,
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

}
