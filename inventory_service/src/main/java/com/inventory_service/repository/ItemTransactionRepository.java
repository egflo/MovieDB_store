package com.inventory_service.repository;

import com.inventory_service.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemTransactionRepository extends JpaRepository<Transaction, Long> {

}
