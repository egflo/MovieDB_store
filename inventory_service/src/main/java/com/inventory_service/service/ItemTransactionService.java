package com.inventory_service.service;

import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.model.Transaction;
import com.inventory_service.model.Type;
import com.inventory_service.repository.ItemTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class ItemTransactionService  implements ItemTransactionServiceImp {

    private static final Logger LOGGER = Logger.getLogger(CartService.class.getName());

    private final ItemTransactionRepository itemTransactionRepository;

    @Autowired
    public ItemTransactionService(ItemTransactionRepository itemTransactionRepository) {
        this.itemTransactionRepository = itemTransactionRepository;
    }

    @Override
    public void updateTransaction(long id, String itemId, Integer quantity, Type type, String reason) {
        Optional<Transaction> transaction = itemTransactionRepository.findById(id);
        if (transaction.isPresent()) {
            Transaction transaction1 = transaction.get();
            transaction1.setProductId(itemId);
            transaction1.setQuantity(quantity);
            transaction1.setType(type);
            transaction1.setReason(reason);
            transaction1.setUpdated(new Date());
            itemTransactionRepository.save(transaction1);
        }
        throw new IdNotFoundException( "Transaction not found for this id :: " + id);
    }

    @Override
    public void deleteTransaction(long id) {
        Optional<Transaction> transaction = itemTransactionRepository.findById(id);
        transaction.ifPresent(itemTransactionRepository::delete);
        throw new IdNotFoundException( "Transaction not found for this id :: " + id);
    }

    @Override
    public void createTransaction(String itemId, Integer quantity, Type type, String reason) {
        Transaction transaction = new Transaction(itemId, quantity, type, reason);

        Transaction save = itemTransactionRepository.save(transaction);
        LOGGER.info("Transaction created successfully");

    }
}
