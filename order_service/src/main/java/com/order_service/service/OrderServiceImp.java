package com.order_service.service;

import com.order_service.dto.RefundDTO;
import com.order_service.model.Order;
import com.order_service.request.OrderRequest;
import com.stripe.exception.StripeException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

public interface OrderServiceImp {

    public Page<Order> searchByText(String text, String userId, PageRequest pageRequest);
    public Order getOrder(Integer id);
    public Order createOrder(OrderRequest orderRequest) throws StripeException;

    public RefundDTO deleteOrder(Integer id);

    public void cancelOrder(Integer id);

    public Page<Order> getAllOrders(PageRequest pageRequest);
    public Page<Order> getOrdersByUserId(String userId, PageRequest pageRequest);

    Page<Order> getOrdersByUserId(String userId, String term, PageRequest pageRequest);

    public Page<Order> getOrdersByOrderId(Long orderId, PageRequest pageRequest);
    public Page<Order> getOrdersByUserIdAndOrderId(String userId, Long orderId, PageRequest pageRequest);

    public Page<Order> getOrdersByPostcode(String postcode, PageRequest pageRequest);
}
