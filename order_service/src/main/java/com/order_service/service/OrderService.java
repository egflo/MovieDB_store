package com.order_service.service;

import com.order_service.dto.*;
import com.order_service.exception.OrderException;
import com.order_service.grpc.CartService;
import com.order_service.grpc.MovieService;
import com.order_service.grpc.UserService;
import com.order_service.model.Shipping;
import com.order_service.model.Order;
import com.order_service.model.OrderItem;
import com.order_service.model.Status;
import com.order_service.repository.ShippingRepository;
import com.order_service.repository.OrderItemRepository;
import com.order_service.repository.OrderRepository;
import com.order_service.request.AddressRequest;
import com.order_service.request.OrderItemRequest;
import com.order_service.request.OrderRequest;
import com.order_service.request.ShippingRequest;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.tax.Calculation;
import org.proto.grpc.CartResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.logging.Logger;

@Service
@Transactional
public class OrderService implements OrderServiceImp {

    final static Logger LOGGER = Logger.getLogger(OrderService.class.getName());

    OrderRepository orderRepository;
    ShippingRepository addressRepository;
    OrderItemRepository orderItemRepository;

    MovieService movieService;
    StripeService stripeService;
    UserService userService;
    CartService cartService;


    @Autowired
    public OrderService(OrderRepository orderRepository, ShippingRepository
            addressRepository, OrderItemRepository orderItemRepository
            , CartService cartService, StripeService stripeService, MovieService movieService, UserService userService)
    {
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.stripeService = stripeService;
        this.movieService = movieService;
        this.userService = userService;
    }

    public Object createCheckoutSession(String userId) {
        try {
            return stripeService.createCheckoutSession(userId);
        } catch (StripeException e) {
            throw new OrderException(e.getUserMessage());
        }
    }


    public Object getInvoiceUpcoming(String userId) {

        Map<String, Object> response = new HashMap<>();
        Invoice upcomingInvoice = stripeService.upcomingInvoice(userId);
        response.put("amount_total", upcomingInvoice.getAmountDue());
        response.put("tax_breakdown", upcomingInvoice.getTax());
        response.put("tax_inclusive", upcomingInvoice.getShippingCost());
        response.put("tax_exclusive", upcomingInvoice.getSubtotal());
        return response;
    }

    public Object createPaymentSheet(String userId)  {
        Object paymentSheet = null;
        try {
            paymentSheet = stripeService.createPaymentSheet(userId);
        } catch (StripeException e) {
            throw new OrderException(e.getUserMessage());
        }

        return paymentSheet;
    }

    public InvoiceDTO getInvoice(String userId) {

        InvoiceDTO invoice = new InvoiceDTO();
        try {
            LOGGER.info("Getting invoice for user: " + userId);
            Customer customer = stripeService.getCustomer(userId);

            LOGGER.info("Getting addresses for user: " + userId);
            //Get addresses
            List<AddressDTO> addresses = userService.getAddresses(userId);
            //Find default address else use first address return null if no address
            AddressDTO address = addresses.stream()
                    .filter(AddressDTO::isDefault)
                    .findFirst()
                    .orElse(addresses.get(0));

            LOGGER.info("Getting cart for user: " + userId);
            CartResponse cart = cartService.getCart(userId);

            long subTotal = 0L;
            List<CartItemDTO> items = new ArrayList<>();
            for (org.proto.grpc.CartItem item : cart.getItemsList()) {
                CartItemDTO cartItem = new CartItemDTO(item);
                items.add(cartItem);
                subTotal += (long) cartItem.getPrice() * cartItem.getQuantity();
            }

            invoice.setAddress(address);
            invoice.setItems(items);
            //RateResponse rate = rateService.getRate(addressRequest.getPostcode());
            Calculation calculation = stripeService.calculation(userId, address, cart);

            LOGGER.info("Calculation: " + calculation);
            //Get Payment Sheet
            PaymentSheetDTO paymentSheet = stripeService.createPaymentSheet(customer, calculation);

            invoice.setPaymentSheet(paymentSheet);
            invoice.setTotal(calculation.getAmountTotal());
            invoice.setSubTotal(subTotal);
            invoice.setTax(calculation.getTaxAmountExclusive());
            invoice.setShipping(calculation.getShippingCost().getAmount());


        } catch (StripeException e) {

            throw new OrderException(e.getUserMessage());
        }

        return invoice;

    }

    public InvoiceDTO getInvoice(String userId, AddressRequest addressRequest) {

        InvoiceDTO invoice = new InvoiceDTO();
        try {
            Customer customer = stripeService.getCustomer(userId);
            CartResponse cart = cartService.getCart(userId);
            AddressDTO address = new AddressDTO(addressRequest);

            long subTotal = 0L;
            List<CartItemDTO> items = new ArrayList<>();
            for (org.proto.grpc.CartItem item : cart.getItemsList()) {
                CartItemDTO cartItem = new CartItemDTO(item);
                items.add(cartItem);
                subTotal += (long) cartItem.getPrice() * cartItem.getQuantity();
            }

            invoice.setAddress(address);
            invoice.setItems(items);
            Calculation calculation = stripeService.calculation(userId, address, cart);

            //Get Payment Sheet
            PaymentSheetDTO paymentSheet = stripeService.createPaymentSheet(customer, calculation);
            invoice.setPaymentSheet(paymentSheet);
            invoice.setTotal(calculation.getAmountTotal());
            invoice.setSubTotal(subTotal);
            invoice.setTax(calculation.getTaxAmountExclusive());
            invoice.setShipping(calculation.getShippingCost().getAmount());

        } catch (StripeException e) {

            throw new OrderException(e.getUserMessage());
        }

        return invoice;
    }

    @Override
    public Page<Order> searchByText(String text, String userId, PageRequest pageRequest) {
        //Search by order item description
        return orderRepository.findByOrderItemDescription(text, userId, pageRequest);
    }

    @Override
    public Order getOrder(Integer id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new OrderException("Order not found for this id :: " + id));
    }

    @Override
    public Order createOrder(OrderRequest orderRequest) throws StripeException {

        PaymentIntent intent = stripeService.getPaymentIntent(orderRequest.getPaymentId());
        Charge charge = stripeService.getCharge(intent.getLatestCharge());

        ShippingRequest requestAddress = orderRequest.getAddress();
        CartResponse cart = cartService.getCart(orderRequest.getUserId());

        Order order = new Order();
        order.setUserId(orderRequest.getUserId());
        order.setTotal(orderRequest.getTotal());
        order.setSubTotal(orderRequest.getSubTotal());
        order.setTax(orderRequest.getTax());
        order.setCreated(new Date());
        order.setUpdated(new Date());
        order.setStatus(Status.CREATED);
        order.setNetwork(charge.getPaymentMethodDetails().getCard().getNetwork());
        order.setPaymentType(charge.getPaymentMethodDetails().getType());
        order.setPaymentId(charge.getPaymentIntent());
        order.setCurrency(charge.getCurrency());

        for(OrderItemRequest item : orderRequest.getItems() ) {
            OrderItem orderItem = new OrderItem();
            orderItem.setItemId(item.getItemId());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setPrice(item.getPrice());
            orderItem.setCreated(new Date());
            orderItem.setUpdated(new Date());
            orderItem.setPhoto(item.getImageUrl());
            orderItem.setDescription(item.getDescription());
            orderItem.setSku(item.getSKU());
            order.addItem(orderItem);
        }

        Shipping address = new Shipping();
        address.setFirstName(requestAddress.getFirstName());
        address.setLastName(requestAddress.getLastName());
        address.setStreet(requestAddress.getStreet());
        address.setCity(requestAddress.getCity());
        address.setState(requestAddress.getState());
        address.setPostalCode(requestAddress.getPostcode());
        address.setCountry(requestAddress.getCountry());

        order.addShipping(address);
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
    public Page<Order> getOrdersByUserId(String userId, String term, PageRequest pageRequest) {

        if(term != null) {
            return orderRepository.findByUserIdAndTerm(term, userId, pageRequest);
        }
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
    public RefundDTO deleteOrder(Integer id) {

        Optional<Order> order = orderRepository.findById(id);
        if(order.isPresent()) {
            Order orderToDelete = order.get();
            //Set status to cancelled
            orderToDelete.setStatus(Status.CANCELLED);
            orderRepository.save(orderToDelete);
            //Refund payment
            Refund refund = stripeService.refund(orderToDelete.getPaymentId());
            RefundDTO refundDTO = new RefundDTO(refund.getId(), refund.getCreated(), refund.getCurrency(), refund.getPaymentIntent(), refund.getAmount(), refund.getStatus());
            orderRepository.delete(order.get());
            return refundDTO;
        }
        else {
            throw new OrderException("Order not found for this id :: " + id);
        }
    }

}
