package com.order_service.service;


import com.order_service.dto.AddressDTO;
import com.order_service.model.Address;
import com.order_service.model.OrderItem;
import com.order_service.repository.AddressRepository;
import com.order_service.repository.OrderItemRepository;
import com.order_service.repository.OrderRepository;
import com.order_service.request.OrderRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class OrderService {

    OrderRepository orderRepository;
    AddressRepository addressRepository;
    OrderItemRepository orderItemRepository;

    @Autowired
    public OrderService(OrderRepository orderRepository, AddressRepository addressRepository, OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.addressRepository = addressRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public ResponseEntity<?> getOrder(Integer id) {
        return orderRepository.findById(id)
                .map(order -> new ResponseEntity<>(order, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    public ResponseEntity<?> createOrder(OrderRequest orderRequest) {
        return new ResponseEntity<>(null, HttpStatus.CREATED);
    }

    public ResponseEntity<?> getAllOrders(PageRequest pageRequest) {
        return ResponseEntity.ok(orderRepository.findAll(pageRequest));
    }


}
