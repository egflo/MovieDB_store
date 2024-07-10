package com.order_service.service;

import com.order_service.dto.AddressDTO;
import com.order_service.dto.PaymentMethodDTO;
import com.order_service.dto.PaymentSheetDTO;
import com.order_service.dto.UserDTO;
import com.order_service.exception.FirebaseServiceException;
import com.order_service.exception.StripeServiceException;
import com.order_service.model.User;
import com.order_service.request.AddressRequest;
import com.order_service.request.PaymentRequest;
import com.stripe.Stripe;
import com.stripe.exception.*;
import com.stripe.model.*;
import com.stripe.model.tax.Calculation;
import com.stripe.param.*;
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
import java.util.stream.Collectors;

@Transactional
@Service
public class StripeService {
    @Value("${stripe.secret.key}")
    private String secretKey;

    @Value("${stripe.public.key}")
    private String publicKey;

    @Autowired
    FirebaseService firebaseService;

    @Autowired
    CartService cartService;

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
        Calculation calculation = calculation(userId, addressDTO);

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


    public Customer updateCustomer(String userId, String customerId) throws StripeException {

        CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .build();

        Customer customer = Customer.create(customerParams);

        //Save to firestore
        firebaseService.updateUser(userId, customer.getId());
        return customer;
    }

    public Customer createCustomer(String userId) throws StripeException {
        boolean exists = firebaseService.userExists(userId);


        //Check if user exists, if not create user else get user
        UserDTO user = null;
        if (exists) {
            user = firebaseService.getUser(userId);

            //If not customer id, create customer
            if (user.getCustomerId() == null || user.getCustomerId().isEmpty()) {
                return updateCustomer(userId, user.getCustomerId());
            }


            return getCustomer(user.getId());
        }

        CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .build();

        Customer customer = Customer.create(customerParams);
        //Save to firestore
        firebaseService.addUser(userId, customer.getId());

        return customer;
    }


    public Customer createCustomer(String userId, String email) throws StripeException {

        boolean exists = firebaseService.userExists(userId);

        //Check if user exists, if not create user else get user
        UserDTO user = null;
        if (exists) {
            user = firebaseService.getUser(userId);
            Customer customer = getCustomer(user.getId());
            return customer;
        }

        CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .setEmail(email)
                .build();

        Customer customer = Customer.create(customerParams);
        //Save to firestore
        firebaseService.addUser(userId, customer.getId(), email);

        return customer;
    }

    public Invoice upcomingInvoice(String userId)  {

        try {
            Customer customer = createCustomer(userId);

            //Get addresses
            List<AddressDTO> addresses = firebaseService.getUserAddresses(userId);
            //Find default address else use first address return null if no address
            AddressDTO defaultAddress = addresses.stream()
                    .filter(AddressDTO::getisDefault)
                    .findFirst()
                    .orElse(addresses.get(0));



            CartResponse cart = cartService.getCart(userId);
            List<CartItem>  items= cart.getItemsList();
            List<InvoiceUpcomingParams.InvoiceItem> invoiceItems = new ArrayList<>();

            for (CartItem item : items) {
                InvoiceUpcomingParams.InvoiceItem invoiceItem = InvoiceUpcomingParams.InvoiceItem.builder()
                        .setCurrency(item.getCurrency())
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
            System.out.println(e.getMessage());
            System.out.println(e.getStripeError());
            System.out.println(e.getStripeError());
            throw new StripeServiceException(e.getMessage(), e);
        }

    }


    public Customer getCustomer(String userId) throws StripeException {

        UserDTO user = firebaseService.getUser(userId);
        String customerId = user.getCustomerId();

        return Customer.retrieve(customerId);
    }

    public void deleteCustomer(String id) throws StripeException {

        UserDTO user = firebaseService.getUser(id);
        String customerId = user.getCustomerId();

        Customer customer = Customer.retrieve(customerId);
        customer.delete();
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

    public Calculation calculation(String userId, AddressDTO userAddress) throws StripeException {
        //Get Users cart items for calculation
        CartResponse cart = cartService.getCart(userId);;

        List<CalculationCreateParams.LineItem> lineItems = cart.getItemsList().stream()
                .map(item -> CalculationCreateParams.LineItem.builder()
                        .setAmount(((long) item.getQuantity() * item.getPrice()))
                        .setQuantity((long) item.getQuantity())
                        .setReference(item.getSku())
                        .build())
                .collect(Collectors.toList());


        CalculationCreateParams.CustomerDetails.Address address = CalculationCreateParams.CustomerDetails.Address
                .builder()
                .setLine1(userAddress.getStreet())
                .setCity(userAddress.getCity())
                .setCountry(userAddress.getCountry())
                .setPostalCode(userAddress.getPostalCode())
                .build();

        //Set Shipping Cost
       // lineItems.add(CalculationCreateParams.LineItem.builder()
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
                        .setCurrency(cart.getItemsList().get(0).getCurrency())
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


        Calculation calculation = Calculation.create(params);

        return calculation;
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


    public void setDefaultPaymentMethod(String userId, String paymentMethodId) {
        try {
            // Retrieve the user from your service
            UserDTO user = firebaseService.getUser(userId);

            // Update the customer's default payment method
            Customer customer = Customer.retrieve(user.getCustomerId());
            CustomerUpdateParams params = CustomerUpdateParams.builder()
                    .setInvoiceSettings(CustomerUpdateParams.InvoiceSettings.builder()
                            .setDefaultPaymentMethod(paymentMethodId)
                            .build())
                    .build();

            Customer updatedCustomer = customer.update(params);

            // Optionally, you might want to log or return the updated customer details
            System.out.println("Updated customer: " + updatedCustomer);

        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public void addPaymentMethod(String userId, String paymentMethodId)  {

        try {
            UserDTO user = firebaseService.getUser(userId);

            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);
            paymentMethod.attach(PaymentMethodAttachParams.builder()
                    .setCustomer(user.getCustomerId())
                    .build());
        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }

    public void updatePaymentMethod(String userId, String paymentMethodId, Map<String, Object> updates) {
        try {
            // Retrieve the user from your service
            UserDTO user = firebaseService.getUser(userId);

            // Retrieve the payment method from Stripe
            PaymentMethod paymentMethod = PaymentMethod.retrieve(paymentMethodId);

            // Check if the payment method belongs to the user
            if (!paymentMethod.getCustomer().equals(user.getCustomerId())) {
                throw new IllegalArgumentException("Payment method does not belong to the user");
            }

            // Update the payment method with the provided updates
            PaymentMethod updatedPaymentMethod = paymentMethod.update(updates);

            // Optionally, you might want to log or return the updated payment method details
            System.out.println("Updated payment method: " + updatedPaymentMethod);

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
            UserDTO user = firebaseService.getUser(userId);

            String defaultPaymentMethodId = getDefaultPaymentMethodId(user.getCustomerId());

            PaymentMethodCollection paymentMethodCollection = PaymentMethod.list(PaymentMethodListParams.builder()
                    .setCustomer(user.getCustomerId())
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

    public Charge getCharge(String latestCharge) {
        try {
            return Charge.retrieve(latestCharge);
        } catch (StripeException e) {
            throw new StripeServiceException(e.getMessage(), e);
        }
    }



}
