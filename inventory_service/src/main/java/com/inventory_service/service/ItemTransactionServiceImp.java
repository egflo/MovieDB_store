package com.inventory_service.service;

import com.inventory_service.model.Type;

public interface ItemTransactionServiceImp {
    void updateTransaction(long id, String itemId, Integer quantity, Type type, String reason);
    void deleteTransaction(long id);
    void createTransaction(String itemId, Integer quantity, Type type, String reason);

}
