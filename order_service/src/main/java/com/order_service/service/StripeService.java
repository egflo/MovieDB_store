package com.order_service.service;

import com.order_service.dto.PaymentIntentDTO;
import com.order_service.request.PaymentIntentRequest;
import com.stripe.Stripe;
import com.stripe.exception.*;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Transactional
@Service
public class StripeService {
    @Value("${stripe.secret.key}")
    private String secretKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }


    public PaymentIntentDTO createPaymentIntent(PaymentIntentRequest request) {
        try {

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setCurrency(request.getCurrency())
                            .setAmount(request.getAmount().longValue() * 100L)
                            .addPaymentMethodType(request.getPaymentMethodType())
                            .setReceiptEmail(request.getStripeEmail())

                            .build();

            PaymentIntent paymentIntent =
                    PaymentIntent.create(params);

            return new PaymentIntentDTO(paymentIntent, null);

        } catch (CardException e) {
            // Since it's a decline, CardException will be caught
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
