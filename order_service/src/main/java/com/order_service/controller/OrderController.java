package com.order_service.controller;


import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.order_service.exception.OrderException;
import com.order_service.request.AddressRequest;
import com.order_service.request.PaymentRequest;
import com.order_service.request.OrderRequest;
import com.stripe.exception.StripeException;
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


    @GetMapping("/payment-sheet")
    public @ResponseBody ResponseEntity<?>
    getPaymentSheet(@RequestHeader HttpHeaders headers) {

        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        return new ResponseEntity<>(orderService.createPaymentSheet(subject), HttpStatus.OK);

    }


    @GetMapping("/invoice")
    public @ResponseBody ResponseEntity<?>
    getInvoice(@RequestHeader HttpHeaders headers) {

        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        return new ResponseEntity<>(orderService.getInvoice(subject), HttpStatus.OK);

    }

    @PostMapping("/invoice")
    public @ResponseBody ResponseEntity<?>
    getInvoiceAddress(@RequestHeader HttpHeaders headers, @RequestBody AddressRequest addressRequest) {

            String token = headers.get("authorization").get(0).split(" ")[1].trim();
            DecodedJWT jwt = JWT.decode(token);
            String subject = jwt.getSubject();

            System.out.println("Address Request: " + addressRequest);

            return new ResponseEntity<>(orderService.getInvoice(subject,addressRequest), HttpStatus.OK);

    }

    @GetMapping("/upcoming/invoice")
    public @ResponseBody ResponseEntity<?>
    getInvoiceUpcoming(@RequestHeader HttpHeaders headers) {

        String token = headers.get("authorization").get(0).split(" ")[1].trim();
        DecodedJWT jwt = JWT.decode(token);
        String subject = jwt.getSubject();

        return new ResponseEntity<>(orderService.getInvoiceUpcoming(subject), HttpStatus.OK);

    }


    @PostMapping("/")
    public @ResponseBody ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) throws StripeException {

        return new ResponseEntity<>(orderService.createOrder(orderRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public @ResponseBody ResponseEntity<?> getOrder(@PathVariable(value = "id") Integer id) {

        if(id == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }


        return new ResponseEntity<>(orderService.getOrder(id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public @ResponseBody ResponseEntity<?> deleteOrder(@PathVariable(value = "id") Integer id) {

        if(id == null) {
            throw new IllegalArgumentException("Id cannot be null");
        }

        return new ResponseEntity<>(orderService.deleteOrder(id), HttpStatus.OK);
    }

    @GetMapping("/user/")
    public @ResponseBody ResponseEntity<?> getOrderByUserId(
            @RequestHeader HttpHeaders headers,
            @RequestParam Optional<String> term,
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

        return new ResponseEntity<>(orderService.getOrdersByUserId(
                subject,
                term.orElse(null),
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(10),
                        Sort.by(sortDirection, sortBy.orElse("id"))
                )), HttpStatus.OK);
    }

    @GetMapping("/user/{text}")
    public @ResponseBody ResponseEntity<?> searchByText(
            @RequestHeader HttpHeaders headers,
            @PathVariable(value = "text") String text,
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

        return new ResponseEntity<>(orderService.searchByText(text, subject,
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
