package com.user_service.service;

import com.user_service.DTO.SentimentDTO;
import com.user_service.DTO.SentimentRequest;
import com.user_service.models.Sentiment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface SentimentServiceImp {
    SentimentDTO getSentiment(String id);

    SentimentDTO createSentiment(SentimentRequest sentiment);

    void deleteSentiment(String id);

    SentimentDTO updateSentiment(String id, SentimentRequest sentiment);

    Optional<SentimentDTO> findByUserIdAndObjectId(String userId, String objectId);

    Page<SentimentDTO> getSentimentByObjectId(String objectId, Pageable pageRequest);

    Page<SentimentDTO> getSentimentByUserId(String userId, Pageable pageRequest);

    Page<SentimentDTO> getAllSentiments(Pageable pageRequest);

    Page<SentimentDTO> findByCreatedAfter(String date, Pageable pageable);

    Integer countSentimentByObjectIdAndStatus(String id, String status);

    SentimentDTO findByObjectId(String subject, String id);
}
