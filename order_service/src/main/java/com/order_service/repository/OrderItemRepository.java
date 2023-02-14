package com.order_service.repository;

import com.order_service.model.Order;
import com.order_service.model.OrderItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("OrderItemRepository")
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    Optional<OrderItem> findById(Integer id);

    Page<OrderItem> findAll(Pageable page);

}