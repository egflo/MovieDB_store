package com.movie_service.service;

import com.movie_service.grpc.ItemService;
import com.movie_service.models.Movie;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.proto.grpc.ItemResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.BulkOperations;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;

/**
 * Keeps {@link Movie#getPrice()} in step with inventory_service, which owns
 * prices in Postgres. Search runs in Mongo, so filtering or sorting by price
 * needs a copy on each movie.
 *
 * Pulls rather than being pushed to: inventory's existing getItems RPC answers
 * a batch of ids, so no new endpoint is needed. (A write endpoint on this
 * service would be reachable through the gateway's discovery routes by any
 * signed-in user.) Runs shortly after startup and then every
 * {@code prices.sync-interval}. A failed run, typically because inventory isn't
 * registered with Eureka yet, is retried a minute later. Only changed prices are
 * written, so a run with nothing to do is just reads.
 */
@Service
public class PriceSyncService {

    static final Logger LOGGER = LoggerFactory.getLogger(PriceSyncService.class);

    private static final int BATCH_SIZE = 500;

    private final MongoTemplate mongoTemplate;
    private final ItemService itemService;
    private final Duration interval;

    private volatile Instant nextRun = Instant.EPOCH;

    public PriceSyncService(MongoTemplate mongoTemplate, ItemService itemService,
                            @Value("${prices.sync-interval:PT1H}") Duration interval) {
        this.mongoTemplate = mongoTemplate;
        this.itemService = itemService;
        this.interval = interval;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void createIndex() {
        // Serves the price filter and the price sort, whose ties MovieDAO breaks
        // by _id. Idempotent: a no-op once the index exists.
        mongoTemplate.indexOps(Movie.class).createIndex(
                new Index().on("price", Sort.Direction.ASC).on("_id", Sort.Direction.ASC));
    }

    @Scheduled(initialDelayString = "PT30S", fixedDelayString = "PT1M")
    public void tick() {
        if (Instant.now().isBefore(nextRun)) {
            return;
        }
        try {
            sync();
            nextRun = Instant.now().plus(interval);
        } catch (RuntimeException e) {
            LOGGER.warn("Price sync failed, retrying in a minute: {}", e.getMessage());
        }
    }

    /** One pass over every movie. Returns the number of prices changed. */
    public int sync() {
        long started = System.currentTimeMillis();
        int seen = 0;
        int changed = 0;

        Query query = new Query();
        query.fields().include("_id").include("price");

        Map<String, Integer> batch = new HashMap<>();
        try (Stream<Document> docs = mongoTemplate.stream(query, Document.class, "movies")) {
            for (Document doc : (Iterable<Document>) docs::iterator) {
                batch.put(doc.getObjectId("_id").toHexString(), doc.getInteger("price"));
                seen++;
                if (batch.size() == BATCH_SIZE) {
                    changed += syncBatch(batch);
                    batch.clear();
                }
            }
        }
        if (!batch.isEmpty()) {
            changed += syncBatch(batch);
        }

        LOGGER.info("Price sync: {} movies checked, {} prices changed in {} ms",
                seen, changed, System.currentTimeMillis() - started);
        return changed;
    }

    /** @param current movie id to its stored price (null if none) */
    private int syncBatch(Map<String, Integer> current) {
        Map<String, Integer> prices = new HashMap<>();
        for (ItemResponse item : itemService.getItems(new ArrayList<>(current.keySet())).getItemsList()) {
            // Proto3 sends an unset price as 0, which means "no price" here.
            prices.put(item.getId(), item.getPrice() > 0 ? item.getPrice() : null);
        }

        int updates = 0;
        BulkOperations bulk = mongoTemplate.bulkOps(BulkOperations.BulkMode.UNORDERED, "movies");
        for (Map.Entry<String, Integer> entry : current.entrySet()) {
            Integer price = prices.get(entry.getKey()); // null: no product, or no price
            if (Objects.equals(price, entry.getValue())) {
                continue;
            }
            Query byId = Query.query(Criteria.where("_id").is(new ObjectId(entry.getKey())));
            bulk.updateOne(byId, price == null ? new Update().unset("price") : Update.update("price", price));
            updates++;
        }
        if (updates > 0) {
            bulk.execute();
        }
        return updates;
    }
}
