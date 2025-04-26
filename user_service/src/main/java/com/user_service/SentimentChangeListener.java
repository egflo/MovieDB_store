package com.user_service;

import com.mongodb.client.MongoCollection;
import com.user_service.models.Status;
import jakarta.annotation.PostConstruct;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Component;

import java.util.Stack;

@Component
public class SentimentChangeListener {

    private static final Logger logger = LoggerFactory.getLogger(SentimentChangeListener.class);

    private final MongoTemplate mongoTemplate;

    public SentimentChangeListener(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    // This method is used to listen for changes in the sentiment collection
    // and update the review/comment based on the sentiment type
    // The method is annotated with @Async to run in a separate thread
    //@Async("taskExecutor")
    public void startChangeStream() {
        logger.info("Sentiment Listener in thread " + Thread.currentThread().getName());

        MongoCollection<Document> collection = mongoTemplate.getDb().getCollection("sentiment");

        //log collection being used
        logger.info("Collection: " + collection.getNamespace().getCollectionName());

        //log database being used
        logger.info("Database: " + collection.getNamespace().getDatabaseName());

        collection.watch().forEach(changeStreamDocument -> {

            Document fullDocument = changeStreamDocument.getFullDocument();
            String operationType = changeStreamDocument.getOperationType().getValue();

            if (!"insert".equals(operationType)) {
                return;
            }

            ObjectId objectId = fullDocument.getObjectId("objectId");
            String type = fullDocument.getString("status");
            //Convert to enum
            Status status = Status.valueOf(type);
            logger.info("Object ID: " + objectId + " status: " + status);

            if (mongoTemplate.exists(Query.query(Criteria.where("_id").is(objectId)), "reviews")) {
                logger.info("Found review with id: " + objectId);

                if (status == Status.LIKE) {
                    mongoTemplate.updateFirst(
                            Query.query(Criteria.where("_id").is(objectId)),
                            new Update().inc("likes", 1),
                            "reviews"
                    );
                } else if (status == Status.DISLIKE) {
                    mongoTemplate.updateFirst(
                            Query.query(Criteria.where("_id").is(objectId)),
                            new Update().inc("dislikes", 1),
                            "reviews"
                    );
                }
            }

            boolean exists = mongoTemplate.exists(Query.query(Criteria.where("_id").is(objectId)), "comments");
            logger.info("Comment exists: " + exists);
            if (mongoTemplate.exists(Query.query(Criteria.where("_id").is(objectId)), "comments")) {

                logger.info("Found comment with id: " + objectId);

                if (status == Status.LIKE) {
                    mongoTemplate.updateFirst(
                            Query.query(Criteria.where("_id").is(objectId)),
                            new Update().inc("likes", 1),
                            "comments"
                    );
                } else if (status == Status.DISLIKE) {
                    mongoTemplate.updateFirst(
                            Query.query(Criteria.where("_id").is(objectId)),
                            new Update().inc("dislikes", 1),
                            "comments"
                    );
                }
            }

        });
    }
}
