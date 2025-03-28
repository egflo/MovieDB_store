package com.user_service.repository;
import com.movie_service.models.Sentiment;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.Optional;

@Repository("SentimentRepository")
public interface SentimentRepository extends MongoRepository<Sentiment, ObjectId> {

    Page<Sentiment> getSentimentByUserId(String id, Pageable pageable);

    Page<Sentiment>  getSentimentByObjectId(ObjectId id, Pageable pageable);

    Page<Sentiment> getSentimentByCreatedAfter(Date date, Pageable pageable);


    Optional<Sentiment> getSentimentByUserIdAndObjectId(String userId, ObjectId objectId);


    @Query("{'$and': [{'objectId': ?0}, {'$eq': {'isLiked': true}}]}")
    Page<Sentiment> getSentimentByObjectIdIdAndIsLiked(ObjectId id, Pageable pageable);

    @Query("{'$and': [{'objectId': ?0}, {'$eq': {'isLiked': false}}]}")
    Page<Sentiment> getSentimentByObjectIdIdAndIsDisliked(ObjectId id, Pageable pageable);

    Integer countSentimentByObjectIdAndStatus(String id, String status);

}
