package com.order_service.controller;


import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.order_service.exception.OrderException;
import com.order_service.grpc.CartService;
import com.order_service.grpc.UserService;
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
    UserService userService;
    CartService cartService;

    @Autowired
    public OrderController(OrderService orderService, UserService userService , CartService cartService) {
        this.orderService = orderService;
        this.userService = userService;
        this.cartService = cartService;
    }


    @GetMapping("/payment-sheet")
    public @ResponseBody ResponseEntity<?>
    getPaymentSheet(@RequestHeader(value = "uid", required = true) String userId) {

        return new ResponseEntity<>(orderService.createPaymentSheet(userId), HttpStatus.OK);

    }

    @GetMapping("/invoice")
    public @ResponseBody ResponseEntity<?>
    getInvoice(@RequestHeader(value = "uid", required = true) String userId) {

        return new ResponseEntity<>(orderService.getInvoice(userId), HttpStatus.OK);

    }

    @PostMapping("/invoice")
    public @ResponseBody ResponseEntity<?>
    getInvoiceAddress(@RequestHeader(value = "uid", required = true) String userId,
                      @RequestBody AddressRequest addressRequest) {

            return new ResponseEntity<>(orderService.getInvoice(userId,addressRequest), HttpStatus.OK);

    }

    @GetMapping("/upcoming/invoice")
    public @ResponseBody ResponseEntity<?>
    getInvoiceUpcoming(@RequestHeader(value = "uid", required = true) String userId) {

        return new ResponseEntity<>(orderService.getInvoiceUpcoming(userId), HttpStatus.OK);

    }

    @PostMapping("/checkout")
    public @ResponseBody ResponseEntity<?> checkout(
            @RequestHeader(value = "uid", required = true) String userId) throws StripeException {


        // Create the order
        return new ResponseEntity<>(orderService.createCheckoutSession(userId), HttpStatus.OK);
    }

    @PostMapping("/create")
    public @ResponseBody ResponseEntity<?> createOrder(
            @RequestHeader(value = "uid", required = true) String userId,
            @RequestBody OrderRequest orderRequest) throws StripeException {

        orderRequest.setUserId(userId);
        return new ResponseEntity<>(orderService.createOrder(orderRequest), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public @ResponseBody ResponseEntity<?> getOrder(@PathVariable(value = "id") Integer id) {

        return new ResponseEntity<>(orderService.getOrder(id), HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public @ResponseBody ResponseEntity<?> deleteOrder(@PathVariable(value = "id") Integer id) {

        return new ResponseEntity<>(orderService.deleteOrder(id), HttpStatus.OK);
    }

    @GetMapping("/user/")
    public @ResponseBody ResponseEntity<?> getOrderByUserId(
            @RequestHeader(value = "uid", required = true) String userId,
            @RequestParam Optional<String> term,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction) {


        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(orderService.getOrdersByUserId(
                userId,
                term.orElse(null),
                PageRequest.of(
                        page.orElse(0),
                        limit.orElse(10),
                        Sort.by(sortDirection, sortBy.orElse("id"))
                )), HttpStatus.OK);
    }

    @GetMapping("/user/{text}")
    public @ResponseBody ResponseEntity<?> searchByText(
            @RequestHeader(value = "uid", required = true) String userId,
            @PathVariable(value = "text") String text,
            @RequestParam Optional<Integer> limit,
            @RequestParam Optional<Integer> page,
            @RequestParam Optional<String> sortBy,
            @RequestParam Optional<Integer> direction) {

        Sort.Direction sortDirection = Sort.Direction.DESC;
        if (direction.isPresent()) {
            if (direction.get() == 1) {
                sortDirection = Sort.Direction.ASC;
            }
        }

        return new ResponseEntity<>(orderService.searchByText(text, userId,
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
