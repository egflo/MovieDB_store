package com.inventory_service.repository;


import com.inventory_service.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Product, String> {


    Optional<Product> findItemById(String id);
    Optional<Product> findItemBySKU(String sku);

    Page<Product> findAllBySKU(String sku, Pageable pageable);

}
