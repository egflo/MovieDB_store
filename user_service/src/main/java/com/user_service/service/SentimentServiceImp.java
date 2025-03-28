package com.user_service.service;

import com.movie_service.DTO.SentimentRequest;
import com.movie_service.models.Sentiment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface SentimentServiceImp {
    Sentiment getSentiment(String id);

    Sentiment createSentiment(SentimentRequest sentiment);

    void deleteSentiment(String id);

    Sentiment updateSentiment(String id, SentimentRequest sentiment);

    Optional<Sentiment> findByUserIdAndObjectId(String userId, String objectId);

    Page<Sentiment> getSentimentByObjectId(String objectId, Pageable pageRequest);

    Page<Sentiment> getSentimentByUserId(String userId, Pageable pageRequest);

    Page<Sentiment> getAllSentiments(Pageable pageRequest);

    Page<Sentiment> findByCreatedAfter(String date, Pageable pageable);

    Integer countSentimentByObjectIdAndStatus(String id, String status);
}
