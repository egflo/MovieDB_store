package com.inventory_service.service;


import com.inventory_service.DTO.ItemDTO;
import com.inventory_service.exception.IdNotFoundException;
import com.inventory_service.model.Product;
import com.inventory_service.model.Status;
import com.inventory_service.model.Type;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.CategoryRepository;
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

    static final String MOVIE_CATEGORY = "Movie";

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

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

            product.setStatus(statusFor(product.getQuantity()));
            product.setUpdated(new Date());

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

    /**
     * Stock status from the quantity. Zero or below is out of stock: cart adds
     * can push a quantity negative (they don't check stock), and those used to
     * read as LIMITED.
     */
    static Status statusFor(int quantity) {
        if (quantity <= 0) return Status.OUT_OF_STOCK;
        if (quantity < LIMIT) return Status.LIMITED;
        return Status.IN_STOCK;
    }

    /** New products: id is the movie's id (movie_service), SKU its IMDb id. */
    @Override
    public Product add(ItemDTO request) {
        if (request.getId() == null || request.getId().isBlank()) {
            throw new IllegalArgumentException("A product needs the movie's id");
        }
        if (request.getSKU() == null || request.getSKU().isBlank()) {
            throw new IllegalArgumentException("A product needs a SKU (the movie's IMDb id)");
        }
        if (itemRepository.existsById(request.getId())) {
            throw new IllegalArgumentException("A product for " + request.getId() + " already exists");
        }
        int quantity = request.getQuantity() == null ? 0 : request.getQuantity();
        validate(request.getPrice(), quantity);

        Product item = new Product();
        item.setId(request.getId());
        item.setSKU(request.getSKU());
        item.setPrice(request.getPrice());
        item.setCurrency(request.getCurrency() == null ? "usd" : request.getCurrency());
        item.setQuantity(quantity);
        // The constructor's IN_STOCK default was wrong for anything under LIMIT.
        item.setStatus(statusFor(quantity));
        // Every product so far is a movie; without this the type was null.
        categoryRepository.findByName(MOVIE_CATEGORY).ifPresent(item::setType);

        Product saved = itemRepository.save(item);
        if (quantity != 0) {
            transactionService.createTransaction(saved.getId(), quantity, Type.STOCK_ADJUSTMENT,
                    "New product " + saved.getId() + " with " + quantity + " in stock");
        }
        return saved;
    }

    /**
     * Admin edit: price, currency and quantity, each only if sent. This used to
     * copy every non-null DTO field with BeanUtils, which silently skipped
     * `status` (a String in the DTO, an enum here) and never recomputed it, so
     * statuses drifted from the quantities. The status is now always derived,
     * which also repairs a drifted one on the next save.
     */
    @Override
    public Product update(ItemDTO request) {
        Product item = itemRepository.findById(request.getId())
                .orElseThrow(() -> new IdNotFoundException("Item not found for this id :: " + request.getId()));

        Integer price = request.getPrice() != null ? request.getPrice() : item.getPrice();
        int quantity = request.getQuantity() != null ? request.getQuantity() : item.getQuantity();
        validate(price, quantity);

        item.setPrice(price);
        if (request.getCurrency() != null) item.setCurrency(request.getCurrency());
        if (quantity != item.getQuantity()) {
            transactionService.createTransaction(item.getId(), quantity, Type.STOCK_ADJUSTMENT,
                    "Admin set stock of " + item.getId() + " from " + item.getQuantity() + " to " + quantity);
            item.setQuantity(quantity);
        }
        item.setStatus(statusFor(item.getQuantity()));
        item.setUpdated(new Date());
        return itemRepository.save(item);
    }

    private static void validate(Integer price, int quantity) {
        if (price == null || price <= 0) {
            throw new IllegalArgumentException("Price must be more than 0 (in cents)");
        }
        if (quantity < 0) {
            throw new IllegalArgumentException("Quantity can't be negative");
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
