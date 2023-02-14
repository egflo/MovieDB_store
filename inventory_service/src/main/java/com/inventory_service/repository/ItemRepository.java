package com.inventory_service.repository;


import com.inventory_service.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, String> {




    Optional<Item> findItemById(String id);

    Page<Item> findAllBySKU(String sku, Pageable pageable);

}
