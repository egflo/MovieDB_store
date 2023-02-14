package com.order_service.service;


import com.order_service.dto.ChargeDTO;
import com.order_service.dto.PaymentIntentDTO;
import com.stripe.Stripe;
import com.stripe.exception.*;
import com.stripe.model.PaymentIntent;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Transactional
@Service
public class StripeService {
    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public PaymentIntentDTO createCharge(ChargeDTO request) {
        try {
            List<Object> paymentMethodTypes =
                    new ArrayList<>();
            paymentMethodTypes.add("card");

            Map<String, Object> params = new HashMap<>();
            params.put("amount", request.getAmount());
            params.put("currency", request.getCurrency());
            params.put("description", request.getDescription());
            params.put(
                    "payment_method_types",
                    paymentMethodTypes
            );

            PaymentIntent paymentIntent =
                    PaymentIntent.create(params);

            return new PaymentIntentDTO(paymentIntent, null);

        } catch (CardException e) {
            // Since it's a decline, CardException will be caught
            System.out.println("Status is: " + e.getCode());
            System.out.println("Message is: " + e.getMessage());
            return new PaymentIntentDTO(null, e);
        } catch (RateLimitException e) {
            // Too many requests made to the API too quickly
            return new PaymentIntentDTO(null, e);

        } catch (InvalidRequestException e) {
            // Invalid parameters were supplied to Stripe's API
            return new PaymentIntentDTO(null, e);

        } catch (AuthenticationException e) {
            // Authentication with Stripe's API failed
            // (maybe you changed API keys recently)
            return new PaymentIntentDTO(null, e);

        }  catch (StripeException e) {
            // Display a very generic error to the user, and maybe send
            return new PaymentIntentDTO(null, e);

            // yourself an email
        } catch (Exception e) {
            // Something else happened, completely unrelated to Stripe
            return new PaymentIntentDTO(null, null);
        }
    }

}
