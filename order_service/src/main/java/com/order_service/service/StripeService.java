package com.order_service.service;

import com.order_service.dto.AddressDTO;
import com.order_service.dto.PaymentMethodDTO;
import com.order_service.dto.PaymentSheetDTO;
import com.order_service.dto.UserDTO;
import com.order_service.exception.StripeServiceException;
import com.order_service.grpc.CartService;
import com.order_service.grpc.UserService;
import com.order_service.request.AddressRequest;
import com.order_service.request.PaymentRequest;
import com.stripe.Stripe;
import com.stripe.exception.*;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.model.tax.Calculation;
import com.stripe.param.*;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.tax.CalculationCreateParams;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import org.proto.grpc.CartItem;
import org.proto.grpc.CartResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.stripe.param.PaymentIntentCreateParams;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Transactional
@Service
public class StripeService {

    private static final Logger LOGGER = Logger.getLogger(StripeService.class.getName());


    @Value("${stripe.secret.key}")
    private String secretKey;

    @Value("${stripe.public.key}")
    private String publicKey;

    @Autowired
    CartService cartService;

    @Autowired
    UserService userService;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
    }

    public PaymentSheetDTO createPaymentSheet(Customer customer, Calculation calculation) throws StripeException {
        Map<String, Object> params = new HashMap<>();

        EphemeralKey ephemeralKey = generateEphemeralKey(customer.getId());

        //Create PaymentIntent
        PaymentIntent paymentIntent =
                createPaymentIntent(customer, calculation);

        PaymentSheetDTO paymentSheetDTO = new PaymentSheetDTO();
        paymentSheetDTO.setPaymentIntentId(paymentIntent.getId());
        paymentSheetDTO.setEphemeralKey(ephemeralKey.getSecret());
        paymentSheetDTO.setPaymentIntent(paymentIntent.getClientSecret());
        paymentSheetDTO.setCustomer(customer.getId());
        paymentSheetDTO.setPublishableKey(publicKey);

        return paymentSheetDTO;
    }

    public Object createPaymentSheet(String userId) throws StripeException {
        Map<String, Object> params = new HashMap<>();

        //Check if customer exists, if not create customer
        Customer customer = createCustomer(userId);
        CartResponse cart = cartService.getCart(userId);

        //Create ephemeral key
        EphemeralKey ephemeralKey = generateEphemeralKey(customer.getId());

        AddressRequest addressRequest = new AddressRequest();
        addressRequest.setFirstName("John");
        addressRequest.setLastName("Doe");
        addressRequest.setStreet("789 Pine St");
        addressRequest.setCity("Los Angeles");
        addressRequest.setPostcode("90001");
        addressRequest.setCountry("US");
        addressRequest.setPostcode("90001");

        AddressDTO addressDTO = new AddressDTO(addressRequest);

        //Calculate the total amount
        Calculation calculation = calculation(userId, addressDTO, cart);

        //Create PaymentIntent
        PaymentIntent paymentIntent =
                createPaymentIntent(customer, calculation);

        paymentIntent.getId();

        params.put("ephemeralKey", ephemeralKey.getSecret());
        params.put("paymentIntent", paymentIntent.getClientSecret());
        params.put("customer", customer.getId());
        params.put("publishableKey", publicKey);

        //Return the payment sheet
        return params;
    }

    public Customer getCustomer(String id) throws StripeException {
        //Retrieve customer based on customerId or firebase userId
        CustomerSearchParams params = CustomerSearchParams.builder()
                .setQuery("metadata['uid']:'" + id + "'")
                .build();

        CustomerSearchResult customers = Customer.search(params);

        if(customers.getData().isEmpty()) {
            LOGGER.info("Customer not found");

            Customer customer =  createCustomer(id);
            return customer;
        }

        return customers.getData().get(0);
    }

    public Customer createCustomer(String userId) throws StripeException {
        //Retrieve customer if exists based on firebase userId
        CustomerSearchParams params = CustomerSearchParams.builder()
                .setQuery("metadata['uid']:'" + userId + "'")
                .build();

        CustomerSearchResult customers = Customer.search(params);

        if (!customers.getData().isEmpty()) {
            return customers.getData().get(0);
        }

        CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .putMetadata("uid", userId)
                .build();

        Customer customer = Customer.create(customerParams);
        return customer;
    }

    public Customer updateCustomer(String customerId, String userId) throws StripeException {
        //Retrieve customer based on customerId and update metadata with firebase userId
        Customer resource = Customer.retrieve(customerId);
        CustomerUpdateParams params =
                CustomerUpdateParams.builder()
                        .putMetadata("uid", userId)
                        .build();

        Customer customer = resource.update(params);
        return customer;
    }

    public void deleteCustomer(String customerId) throws StripeException {
        Customer customer = Customer.retrieve(customerId);
        customer.delete();
    }


    public Invoice upcomingInvoice(String userId)  {

        try {
            Customer customer = createCustomer(userId);
            //Get addresses
            List<AddressDTO> addresses = userService.getAddresses(userId);
            //Find default address else use first address return null if no address
            AddressDTO defaultAddress = addresses.stream()
                    .filter(AddressDTO::isDefault)
                    .findFirst()
                    .orElse(addresses.get(0));

            CartResponse cart = cartService.getCart(userId);
            List<CartItem>  items= cart.getItemsList();
            List<InvoiceUpcomingParams.InvoiceItem> invoiceItems = new ArrayList<>();

            for (CartItem item : items) {
                InvoiceUpcomingParams.InvoiceItem invoiceItem = InvoiceUpcomingParams.InvoiceItem.builder()
                        .setCurrency(cart.getCurrency())
                        .setAmount(((long) item.getQuantity() * item.getPrice()))
                        .build();
                invoiceItems.add(invoiceItem);
            }

            InvoiceUpcomingParams params = InvoiceUpcomingParams.builder()
                    .setCustomer(customer.getId())
                    .addAllInvoiceItem(invoiceItems)
                    .build();

            Invoice invoice = Invoice.upcoming(params);
            return invoice;

        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }

    }

    // Method to generate ephemeral key
    public static EphemeralKey generateEphemeralKey(String customerId) throws StripeException {

        // Define the set of permissions for the ephemeral key
        EphemeralKeyCreateParams params = EphemeralKeyCreateParams.builder()
                .setCustomer(customerId)
                .setStripeVersion("2024-04-10")
                // Add more permissions as needed
                .build();

        // Generate the ephemeral key

        // Return the key as JSON or string to the client
        return EphemeralKey.create(params);
    }

    public PaymentIntent createPaymentIntent(Customer customer, Calculation calculation)  {
        try {

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setCurrency(calculation.getCurrency())
                            .setAmount(calculation.getAmountTotal())
                            //.addPaymentMethodType(PaymentMethod.Type.CARD)
                            .setReceiptEmail(customer.getEmail())
                            .setCustomer(customer.getId())
                            .build();

            return PaymentIntent.create(params);

        } catch (CardException e) {
            // Since it's a decline, CardException will be caught
            throw new StripeServiceException(e.getUserMessage(), e);

        } catch (RateLimitException e) {
            // Too many requests made to the API too quickly
            throw new StripeServiceException(e.getUserMessage(), e);

        } catch (InvalidRequestException e) {
            // Invalid parameters were supplied to Stripe's API
            throw new StripeServiceException(e.getUserMessage(), e);

        } catch (AuthenticationException e) {
            // Authentication with Stripe's API failed
            // (maybe you changed API keys recently)
            throw new StripeServiceException(e.getUserMessage(), e);

        }  catch (StripeException e) {
            // Display a very generic error to the user, and maybe send
            throw new StripeServiceException(e.getMessage(), e);

            // yourself an email
        } catch (Exception e) {
            // Something else happened, completely unrelated to Stripe
            throw new StripeServiceException(e.getMessage(), e);

        }
    }

    public PaymentIntent createPaymentIntent(PaymentRequest request, String customerId)  {
        try {

            PaymentIntentCreateParams params =
                    PaymentIntentCreateParams.builder()
                            .setCurrency(request.getCurrency())
                            .setAmount(request.getAmount().longValue() * 100L)
                            .addPaymentMethodType(request.getPaymentMethodType())
                            .setReceiptEmail(request.getStripeEmail())
                            .setCustomer(customerId)
                            .build();

            return PaymentIntent.create(params);

        } catch (CardException e) {
            // Since it's a decline, CardException will be caught
            throw new StripeServiceException(e.getUserMessage(), e);

        } catch (RateLimitException e) {
            // Too many requests made to the API too quickly
            throw new StripeServiceException(e.getUserMessage(), e);

        } catch (InvalidRequestException e) {
            // Invalid parameters were supplied to Stripe's API
            throw new StripeServiceException(e.getUserMessage(), e);

        } catch (AuthenticationException e) {
            // Authentication with Stripe's API failed
            // (maybe you changed API keys recently)
            throw new StripeServiceException(e.getUserMessage(), e);

        }  catch (StripeException e) {
            // Display a very generic error to the user, and maybe send
            throw new StripeServiceException(e.getMessage(), e);

            // yourself an email
        } catch (Exception e) {
            // Something else happened, completely unrelated to Stripe
            throw new StripeServiceException(e.getMessage(), e);

        }
    }

    public Calculation calculation(String userId, AddressDTO userAddress, CartResponse cart) throws StripeException {
        List<CalculationCreateParams.LineItem> lineItems = cart.getItemsList().stream()
                .map(item -> CalculationCreateParams.LineItem.builder()
                        .setAmount(((long) item.getQuantity() * item.getPrice()))
                        .setQuantity((long) item.getQuantity())
                        .setReference(item.getItemId())
                        .build())
                .collect(Collectors.toList());

        CalculationCreateParams.CustomerDetails.Address address = CalculationCreateParams.CustomerDetails.Address
                .builder()
                .setLine1(userAddress.getStreet())
                .setCity(userAddress.getCity())
                .setCountry(userAddress.getCountry())
                .setPostalCode(userAddress.getPostcode())
                .build();

        //Set Shipping Cost
        //lineItems.add(CalculationCreateParams.LineItem.builder()
               // .setAmount(500L)
               // .setQuantity(1L)
                //.setReference("SHIPPING")
               // .build());

        // Create a tax calculation using the Stripe API
        CalculationCreateParams params =
                CalculationCreateParams
                        .builder()
                        .setShippingCost(
                                CalculationCreateParams.ShippingCost.builder()
                                        .setAmount(500L)
                                        .build()
                        )
                        .setCurrency(cart.getCurrency())
                        .addAllLineItem(lineItems)
                        .setCustomerDetails(
                                CalculationCreateParams.CustomerDetails
                                        .builder()
                                        .setAddress(address)
                                        .setAddressSource(CalculationCreateParams.CustomerDetails.AddressSource.BILLING)
                                        .setAddressSource(CalculationCreateParams.CustomerDetails.AddressSource.SHIPPING)
                                        .build()
                        )
                        .addExpand("line_items.data.tax_breakdown")
                        .build();

        return Calculation.create(params);
    }

    public Refund refund(String paymentIntentId)  {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            return Refund.create(RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .build());
        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public Charge getCharge(String latestCharge) {
        try {
            return Charge.retrieve(latestCharge);
        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public void setDefaultPaymentMethod(String userId, String paymentMethodId) {
        try {
            // Retrieve the user from your service
            Customer customer = getCustomer(userId);

            // Update the customer's default payment method
            CustomerUpdateParams params = CustomerUpdateParams.builder()
                    .setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
                            .setDefaultPaymentMethod(paymentMethodId)
                            .build())
                    .build();

            Customer updatedCustomer = customer.update(params);

            // Optionally, you might want to log or return the updated customer details
            LOGGER.info("Updated customer: " + updatedCustomer);

        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public void addPaymentMethod(String userId, String paymentMethodId)  {

        try {
            Customer customer = getCustomer(userId);

            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            paymentMethod.attach(PaymentMethodAttachParams.builder()
                    .setCustomer(customer.getId())
                    .build());
        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public void updatePaymentMethod(String userId, String paymentMethodId, Map<String, Object> updates) {
        try {
            Customer customer = getCustomer(userId);

            // Retrieve the payment method from Stripe
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);

            // Check if the payment method belongs to the user
            if (!paymentMethod.getCustomer().equals(customer.getId())) {
                throw new IllegalArgumentException("Payment method does not belong to the user");
            }

            // Update the payment method with the provided updates
            PaymentMethod updatedPaymentMethod = paymentMethod.update(updates);

            // Optionally, you might want to log or return the updated payment method details
            LOGGER.info("Updated payment method: " + updatedPaymentMethod);

        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }


    public void deletePaymentMethod(String paymentMethodId)  {
        try {
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            paymentMethod.detach();
        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public String getDefaultPaymentMethodId(String customerId) throws StripeException {
        Customer customer = Customer.retrieve(customerId);
        return customer.getInvoiceSettings().getDefaultPaymentMethod();
    }

    public List<PaymentMethodDTO> getPaymentMethods(String userId) {
        List<PaymentMethodDTO> paymentMethods = new ArrayList<>();

        try {
            Customer customer = getCustomer(userId);
            String defaultPaymentMethodId = getDefaultPaymentMethodId(customer.getId());

            PaymentMethodCollection paymentMethodCollection = PaymentMethod.list(PaymentMethodListParams.builder()
                    .setCustomer(customer.getId())
                    .setType(PaymentMethodListParams.Type.CARD)
                    .build());

            for (PaymentMethod paymentMethod : paymentMethodCollection.getData()) {
                PaymentMethodDTO dto = new PaymentMethodDTO(paymentMethod);
                boolean isDefault = paymentMethod.getId().equals(defaultPaymentMethodId);
                dto.setDefault(isDefault);
                paymentMethods.add(dto);
            }
        }
        catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }

        return paymentMethods;
    }

    public PaymentIntent confirmPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.confirm();
    }

    public PaymentIntent cancelPaymentIntent(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        return paymentIntent.cancel();
    }

    public PaymentIntent getPaymentIntent(String paymentIntentId) throws StripeException {
        return PaymentIntent.retrieve(paymentIntentId);
    }

    public Map<String, String> createCheckoutSession(String userId) throws StripeException {

        Customer customer = getCustomer(userId);
        CartResponse cart = cartService.getCart(userId);

        SessionCreateParams.Builder sessionBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT) // Set the mode to payment - One time payment
                .setSuccessUrl("http://localhost:3000/success")
                .setCancelUrl("http://localhost:3000/cancel")
                .setShippingAddressCollection(
                        SessionCreateParams.ShippingAddressCollection.builder()
                                .addAllowedCountry(SessionCreateParams.ShippingAddressCollection.AllowedCountry.US)
                                .build()
                )
                .setCurrency("usd")
                .setCustomer(customer.getId())
                .setCustomerEmail(customer.getEmail())
                .putMetadata("uid", userId)
                .setClientReferenceId(userId)
                .setAutomaticTax(
                        SessionCreateParams.AutomaticTax.builder()
                                .setEnabled(true)
                                .build()
                )
                .setCustomerUpdate(
                        SessionCreateParams.CustomerUpdate.builder()
                                .setName(
                                        SessionCreateParams.CustomerUpdate.Name.AUTO // Automatically update the customer's name from the shipping address
                                )
                                .setShipping(
                                        SessionCreateParams.CustomerUpdate.Shipping.AUTO // Automatically update the customer's shipping address from the shipping address provided during checkout
                                )
                                .build()

                )
                .addShippingOption(
                        SessionCreateParams.ShippingOption.builder()
                                .setShippingRateData(
                                        SessionCreateParams.ShippingOption.ShippingRateData.builder()
                                                .setDisplayName("Standard Shipping")
                                                .setFixedAmount(SessionCreateParams.ShippingOption.ShippingRateData.FixedAmount.builder()
                                                        .setAmount(500L) // Set shipping cost to $5.00
                                                        .setCurrency("usd")
                                                        .build())
                                                .setType(SessionCreateParams.ShippingOption.ShippingRateData.Type.FIXED_AMOUNT)
                                                .build()
                                )
                                .build()
                )
                .addShippingOption(
                        SessionCreateParams.ShippingOption.builder()
                                .setShippingRateData(
                                        SessionCreateParams.ShippingOption.ShippingRateData.builder()
                                                .setDisplayName("Express Shipping")
                                                .setFixedAmount(SessionCreateParams.ShippingOption.ShippingRateData.FixedAmount.builder()
                                                        .setAmount(1500L) // Set shipping cost to $15.00
                                                        .setCurrency("usd")
                                                        .build())
                                                .setType(SessionCreateParams.ShippingOption.ShippingRateData.Type.FIXED_AMOUNT)
                                                .build()
                                )
                                .build()
                );
        // Add line items to the session
        for (CartItem item : cart.getItemsList()) {
            sessionBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity((long) item.getQuantity())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd")
                                            .setUnitAmount((long) item.getPrice()) // Convert to cents
                                            .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                    .setName(item.getName())
                                                    .setDescription(item.getDescription())
                                                    .addAllImage(List.of(item.getImage()))
                                                    .build())
                                            .build()
                            )
                            .build()
            );
        }

        SessionCreateParams sessionParams = sessionBuilder.build();
        Session session = Session.create(sessionParams);
        Map<String, String> response = new HashMap<>();
        response.put("sessionId", session.getId());
        response.put("publishableKey", publicKey);
        response.put("clientSecret", session.getClientSecret());
        response.put("customerId", customer.getId());
        response.put("customerEmail", customer.getEmail());
        response.put("amount_subtotal", session.getAmountSubtotal().toString());
        response.put("amount_total", session.getAmountTotal().toString());
        response.put("currency", session.getCurrency());
        response.put("payment_status", session.getPaymentStatus());
        response.put("status", session.getStatus());
        response.put("url", session.getUrl());

        LOGGER.info("Checkout session created: " + session);
        return response;
    }

}
