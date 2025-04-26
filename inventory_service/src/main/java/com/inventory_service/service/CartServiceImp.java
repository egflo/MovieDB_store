package com.inventory_service.service;

import com.inventory_service.DTO.CartDTO;
import com.inventory_service.DTO.CartRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CartServiceImp {
    public Page<CartDTO> getAll(Pageable pageable);

    public Page<CartDTO> findAllByItemId(String itemId, Pageable pageable);

    public CartDTO add(CartRequest request);

    public void delete(String userId, Integer id);

    public CartDTO update(CartRequest request);

    public CartDTO findById(Integer id);

    public CartDTO findAllByUserId(String userId);
}
