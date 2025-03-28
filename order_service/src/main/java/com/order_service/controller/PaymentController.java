package com.user_service.controller;

import com.user_service.service.StripeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment-methods")
public class PaymentController {

    @Autowired
    private StripeService stripeService;

    @GetMapping("/payment-methods")
    public ResponseEntity<?> getPaymentMethods(@RequestHeader(value = "uid", required = true) String userId) {
        return ResponseEntity.ok(stripeService.getPaymentMethods(userId));
    }

    @PostMapping("/payment-methods/default/{id}")
    public ResponseEntity<?> defaultPaymentMethods(@RequestHeader(value = "uid", required = true) String userId, @PathVariable String id) {
        stripeService.setDefaultPaymentMethod(userId,id);
        return ResponseEntity.ok("Payment Updated");
    }

    @PutMapping("/payment-methods/{id}")
    public ResponseEntity<?> addPaymentMethods(@RequestHeader(value = "uid", required = true) String userId, @PathVariable String id) {
        stripeService.addPaymentMethod(userId,id);
        return ResponseEntity.ok("Payment Added");
    }

    @DeleteMapping("/payment-methods/{id}")
    public ResponseEntity<?> deletePaymentMethods(@RequestHeader(value = "uid", required = true) String userId, @PathVariable String id) {
        //String token = headers.get("authorization").get(0).split(" ")[1].trim();
        //DecodedJWT jwt = JWT.decode(token);
        // String subject = jwt.getSubject();
        stripeService.deletePaymentMethod(id);
        return ResponseEntity.ok("Payment Deleted");
    }
}
