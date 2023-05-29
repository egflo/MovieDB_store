package com.order_service.service;

import com.order_service.dto.*;
import com.order_service.exception.OrderException;
import com.order_service.model.Address;
import com.order_service.model.Order;
import com.order_service.model.OrderItem;
import com.order_service.model.Status;
import com.order_service.repository.AddressRepository;
import com.order_service.repository.OrderItemRepository;
import com.order_service.repository.OrderRepository;
import com.order_service.request.AddressRequest;
import com.order_service.request.OrderRequest;
import com.order_service.request.PaymentIntentRequest;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.ChargeCollection;
import com.stripe.model.PaymentIntent;
import org.proto.grpc.CartResponse;
import org.proto.grpc.RateResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class OrderService implements OrderServiceImp {

    OrderRepository orderRepository;
    AddressRepository addressRepository;
    OrderItemRepository orderItemRepository;

    CartService cartService;

    MovieService movieService;

    RateService rateService;

    StripeService stripeService;

    @Autowired
    public OrderService(OrderRepository orderRepository, AddressRepository
            addressRepository, OrderItemRepository orderItemRepository
            , CartService cartService, StripeService stripeService, MovieService movieService, RateService rateService) {
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.stripeService = stripeService;
        this.movieService = movieService;
        this.rateService = rateService;
    }


    public PaymentIntentDTO createPaymentIntent(PaymentIntentRequest request) {
        PaymentIntentDTO paymentIntentDTO = stripeService.createPaymentIntent(request);

        if(paymentIntentDTO.getPaymentIntent() != null) {
            PaymentIntentResponse response = new PaymentIntentResponse();
            response.setClientSecret(paymentIntentDTO.getPaymentIntent().getClientSecret());
            response.setPaymentIntentId(paymentIntentDTO.getPaymentIntent().getId());

            return paymentIntentDTO;
        } else {
            StripeException e = paymentIntentDTO.getStripeError();
            throw new RuntimeException(e);
        }

    }

    public Object getCheckout(String userId, String postalCode) {

        CartResponse cart = cartService.getCart(userId);
        RateResponse rate = rateService.getRate(postalCode);

        Double subTotal = 0.0;
        for (org.proto.grpc.CartItem item : cart.getItemsList()) {
            subTotal += item.getPrice() * item.getQuantity();
        }

        Double tax = subTotal * rate.getRate();
        Double shipping = 5.0;
        Double total = subTotal + tax + shipping;

        CheckoutResponse response = new CheckoutResponse();
        response.setUserId(userId);
        response.setCreatedAt(new Date());
        response.setSubTotal(subTotal);
        response.setTax(tax);
        response.setShipping(shipping);
        response.setTotal(total);

        List<CartItemDTO> items = new ArrayList<>();

        cart.getItemsList().forEach(item -> {
            CartItemDTO cartItemDTO = new CartItemDTO(item);
            items.add(cartItemDTO);
        });

        response.setItems(items);

        PaymentIntentRequest paymentIntentRequest = new PaymentIntentRequest();
        paymentIntentRequest.setAmount(total);
        paymentIntentRequest.setCurrency("usd");
        paymentIntentRequest.setDescription("Checkout Session for " + userId);
        paymentIntentRequest.setPaymentMethodType("card");

        PaymentIntentDTO paymentIntentDTO = stripeService.createPaymentIntent(paymentIntentRequest);


        if(paymentIntentDTO.getPaymentIntent() != null) {
            response.setClientSecret(paymentIntentDTO.getPaymentIntent().getClientSecret());
            response.setPaymentIntentId(paymentIntentDTO.getPaymentIntent().getId());

        } else {
            Map<String,Object> error = new HashMap<>();
            error.put("message", paymentIntentDTO.getStripeError().getUserMessage());
            error.put("code", paymentIntentDTO.getStripeError().getCode());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }

        return response;
    }



    @Override
    public Order getOrder(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderException("Order not found for this id :: " + id));
    }

    @Override
    public Order createOrder(OrderRequest orderRequest) throws StripeException {

        System.out.println(orderRequest);
        PaymentIntent intent = stripeService.getPaymentIntent(orderRequest.getPaymentId());
        Charge charge = stripeService.getCharge(intent.getLatestCharge());


        AddressRequest requestAddress = orderRequest.getShipping();
        CartResponse cart = cartService.getCart(orderRequest.getUserId());
        RateResponse responseRate = rateService.getRate(requestAddress.getPostcode());

        Double subTotal = 0.0;
        for (org.proto.grpc.CartItem item : cart.getItemsList()) {
            subTotal += item.getPrice() * item.getQuantity();
        }
        Double tax = subTotal * responseRate.getRate();
        Double shipping = 5.0;
        Double total = subTotal + tax + shipping;

        Order order = new Order();
        order.setUserId(orderRequest.getUserId());
        order.setTotal(total);
        order.setSubTotal(subTotal);
        order.setTax(tax);
        order.setCreated(new Date());
        order.setUpdated(new Date());
        order.setStatus(Status.CREATED);
        order.setNetwork(charge.getPaymentMethodDetails().getCard().getNetwork());
        order.setPaymentType(charge.getPaymentMethodDetails().getType());
        order.setPaymentId(charge.getPaymentIntent());
        order.setCurrency(charge.getCurrency());


        for (org.proto.grpc.CartItem item : cart.getItemsList()) {

            OrderItem orderItem = new OrderItem();
            orderItem.setItemId(item.getItemId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setCreated(new Date());
            orderItem.setUpdated(new Date());
            orderItem.setPhoto(item.getImage());
            orderItem.setDescription(item.getDescription());
            orderItem.setSku(item.getSku());

            order.addItem(orderItem);
        }

        Address address = new Address();
        address.setFirstName(requestAddress.getFirstName());
        address.setLastName(requestAddress.getLastName());
        address.setStreet(requestAddress.getStreet());
        address.setCity(requestAddress.getCity());
        address.setState(requestAddress.getState());
        address.setPostcode(requestAddress.getPostcode());
        address.setCountry(requestAddress.getCountry());

        order.addAddress(address);
        Order savedOrder = orderRepository.save(order);
        System.out.println("Order saved: " + savedOrder.getId());

        return savedOrder;
    }

    @Override
    public Page<Order> getAllOrders(PageRequest pageRequest) {
        return orderRepository.findAll(pageRequest);
    }

    @Override
    public Page<Order> getOrdersByUserId(String userId, PageRequest pageRequest) {
        return orderRepository.findByUserId(userId, pageRequest);
    }

    @Override
    public Page<Order> getOrdersByOrderId(Long id, PageRequest pageRequest) {
        return orderRepository.findById(id, pageRequest);
    }

    @Override
    public Page<Order> getOrdersByUserIdAndOrderId(String userId, Long orderId, PageRequest pageRequest) {
        return orderRepository.findByUserIdAndId(userId, orderId, pageRequest);
    }

    @Override
    public Page<Order> getOrdersByPostcode(String postcode, PageRequest pageRequest) {
        return orderRepository.findByPostcode(postcode, pageRequest);
    }



    @Override
    public void cancelOrder(Integer id) {
        Optional<Order> order = orderRepository.findById(id);
        if(order.isPresent()) {
            order.get().setStatus(Status.CANCELLED);
            orderRepository.save(order.get());
        }

        else {
            throw new OrderException("Order not found for this id :: " + id);
        }
    }

    @Override
    public void deleteOrder(Integer id) {
        Optional<Order> order = orderRepository.findById(id);
        if(order.isPresent()) {
            orderRepository.delete(order.get());
        }
        else {
            throw new OrderException("Order not found for this id :: " + id);
        }
    }

}
