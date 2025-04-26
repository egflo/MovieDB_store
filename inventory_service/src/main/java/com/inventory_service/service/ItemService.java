package com.inventory_service.service;


import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.NullAwareUtils;
import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.model.Product;
import com.inventory_service.model.Status;
import com.inventory_service.model.Type;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.ItemRepository;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;
import java.util.Date;
import java.util.Optional;
import java.util.logging.Logger;


@Service
@Transactional
public class ItemService implements ItemServiceImp {

    private static final Logger LOGGER = Logger.getLogger(ItemService.class.getName());

    static final int LIMIT = 10;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private ItemTransactionService transactionService;

    @Override
    public Product updateInventory(String itemId, int quantity, Type type) {
        Optional<Product> itemOpt = itemRepository.findById(itemId);
        if (itemOpt.isPresent()) {
            Product product = itemOpt.get();

            //Type StockIn or StockOut or StockAdjustment (update quantity)
            if (type == Type.STOCK_IN) {
                product.setQuantity(product.getQuantity() + quantity);
            } else if (type == Type.STOCK_OUT) {
                product.setQuantity(product.getQuantity() - quantity);
            } else if (type == Type.STOCK_ADJUSTMENT) {
                product.setQuantity(quantity);
            } else {
                throw new RuntimeException("Invalid transaction type");
            }

            //Update status
            if (product.getQuantity() == 0) {
                product.setStatus(Status.OUT_OF_STOCK);
            } else if (product.getQuantity() < LIMIT) {
                product.setStatus(Status.LIMITED);
            } else {
                product.setStatus(Status.IN_STOCK);
            }

            //Create transaction
            transactionService.createTransaction(itemId, quantity, type, "Inventory update for item: " + itemId + " :: Type: " + type);

            return itemRepository.save(product);
        }

        throw new IdNotFoundException("Item not found for this id :: " + itemId);
    }

    @Override
    @RateLimiter(name = "RateLimiterService")
    //@TimeLimiter(name = "TimeLimiterService")
    public Page<Product> getAll(Pageable pagable) {
        return itemRepository.findAll(pagable);
    }

    @Override
    public Product add(ItemDTO request) {
        Product item = new Product();
        item.setSKU(request.getSKU());
        item.setId(request.getId());
        item.setQuantity(request.getQuantity());
        item.setPrice(request.getPrice());
        item.setCurrency(request.getCurrency());

        return itemRepository.save(item);
    }

    @Override
    public Product update(ItemDTO request) {
        Optional<Product> itemOpt = itemRepository.findById(request.getId());
        if (itemOpt.isPresent()) {
            Product item = itemOpt.get();
            NullAwareUtils.copyNonNullProperties(request, item);
            return itemRepository.save(item);
        } else {
            throw new RuntimeException("Item not found for this id :: " + request.getId());
        }
    }

    @Override
    //@CircuitBreaker(name = "CircuitBreakerService")
    @RateLimiter(name = "RateLimiterService")
    public Product getItemById(String id) {
        Optional<Product> item = itemRepository.findById(id);
        if(item.isPresent()){
            return item.get();
        }
        throw new IdNotFoundException("Item not found with id: " + id);
    }

    @Override
    public Page<Product> getItemsBySKU(String sku, Pageable pageable) {
        return itemRepository.findAllBySKU(sku, pageable);
    }

    @Override
    public void delete(String id) {
        Optional<Product> item = itemRepository.findById(id);
        item.ifPresent(value -> itemRepository.delete(value));
        throw new IdNotFoundException("Item not found with id: " + id);
    }
}
