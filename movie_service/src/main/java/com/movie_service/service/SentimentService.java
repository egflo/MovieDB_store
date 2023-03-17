package com.movie_service.service;

import com.movie_service.DTO.Response;
import com.movie_service.DTO.SentimentRequest;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.Sentiment;
import com.movie_service.models.Status;
import com.movie_service.repository.SentimentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.ConversionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;


import java.util.Date;
import java.util.Optional;



@Service
public class SentimentService implements SentimentServiceImp {

    @Autowired
    private SentimentRepository repository;

    @Autowired
    ConversionService conversionService;

    @Override
    public Page<Sentiment> findByCreatedAfter(String date, Pageable pageable) {
        return repository.getSentimentByCreatedAfter(new Date(date), pageable);
    }


    @Override
    public Optional<Sentiment> findByUserIdAndObjectId(String userId, String objectId) {
        return repository.getSentimentByUserIdAndObjectId(userId, new ObjectId(objectId));
    }


    @Override
    public Sentiment getSentiment(String id) {
        if (repository.findById(new ObjectId(id)).isPresent()) {
            return repository.findById(new ObjectId(id)).get();
        }

        throw new IdNotFoundException("Sentiment not found with id: " + id);
    }

    @Override
    public Sentiment createSentiment(SentimentRequest request) {

        Optional<Sentiment> sentiment = findByUserIdAndObjectId(request.getUserId(), request.getObjectId());
        if (sentiment.isPresent()) {
            Sentiment sentiment1 = sentiment.get();
            //String to Enum
            Status status = conversionService.convert(request.getStatus(), Status.class);
            sentiment1.setStatus(status);
            return repository.save(sentiment1);
        }

        Sentiment sentiment1 = new Sentiment();
        sentiment1.setObjectId(new ObjectId(request.getObjectId()));
        sentiment1.setUserId(request.getUserId());
        Status status = conversionService.convert(request.getStatus(), Status.class);
        sentiment1.setStatus(status);

        if (request.getCreated() != null) {
            sentiment1.setCreated(new Date(request.getCreated()));
        }
        else {
            sentiment1.setCreated(new Date());
        }

        return repository.save(sentiment1);
    }

    @Override
    public void deleteSentiment(String id) {
        if(repository.findById(new ObjectId(id)).isPresent()) {
            repository.deleteById(new ObjectId(id));
            return;
        }

        throw new IdNotFoundException("Sentiment not found with id: " + id);

    }

    @Override
    public Sentiment updateSentiment(String id, SentimentRequest sentiment) {
        return createSentiment(sentiment);
    }

    @Override
    public Page<Sentiment> getSentimentByObjectId(String objectId, Pageable pageRequest) {
        return repository.getSentimentByObjectId(new ObjectId(objectId), pageRequest);
    }

    @Override
    public Page<Sentiment> getSentimentByUserId(String userId, Pageable pageRequest) {
        return repository.getSentimentByUserId(userId, pageRequest);
    }

    @Override
    public Page<Sentiment> getAllSentiments(Pageable pageRequest) {
        return repository.findAll(pageRequest);
    }


}
