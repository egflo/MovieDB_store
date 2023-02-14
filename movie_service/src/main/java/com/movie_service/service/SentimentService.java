package com.movie_service.service;

import com.movie_service.DTO.Response;
import com.movie_service.DTO.SentimentRequest;
import com.movie_service.models.Sentiment;
import com.movie_service.repository.SentimentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class SentimentService {

    @Autowired
    private SentimentRepository repository;

    public Page<Sentiment> findAll(Pageable pageable) {
        Page<Sentiment> result = repository.findAll(pageable);
        return result;
    }

    public Optional<Sentiment> findById(String id) {
        return repository.findById(new ObjectId(id));
    }

    public Page<Sentiment> findByObjectId(String id, Pageable pageable) {
        return repository.getSentimentByObjectId(new ObjectId(id), pageable);
    }

    public Page<Sentiment> findByUserId(String id, Pageable pageable) {
        return repository.getSentimentByUserId(id, pageable);
    }

    public Page<Sentiment> findByCreatedAfter(String date, Pageable pageable) {
        return repository.getSentimentByCreatedAfter(new Date(date), pageable);
    }


    public Optional<Sentiment> findByUserIdAndObjectId(String userId, String objectId) {
        return repository.getSentimentByUserIdAndObjectId(userId, new ObjectId(objectId));
    }

    public Response save(SentimentRequest request) {

        Response response = new Response();
        System.out.println(request);
        Optional<Sentiment> sentiment = findByUserIdAndObjectId(request.getUserId(), request.getObjectId());
        if (sentiment.isPresent()) {
            Sentiment sentiment1 = sentiment.get();
            sentiment1.setStatus(request.getStatus());
            repository.save(sentiment1);

            response.setMessage("Updated existing sentiment");
            response.setStatus(HttpStatus.OK);
            response.setSuccess(true);
            return response;
        }

        Sentiment sentiment1 = new Sentiment();
        sentiment1.setObjectId(new ObjectId(request.getObjectId()));
        sentiment1.setUserId(request.getUserId());
        sentiment1.setStatus(request.getStatus());

        if (request.getCreated() != null) {
            sentiment1.setCreated(new Date(request.getCreated()));
        }
        else {
            sentiment1.setCreated(new Date());
        }

        repository.save(sentiment1);

        response.setMessage("Created new sentiment");
        response.setSuccess(true);
        response.setStatus(HttpStatus.OK);
        return response;
    }
    public void delete(String id) {
        repository.deleteById(new ObjectId(id));
    }

    public Sentiment get(String id) {
        return repository.findById(new ObjectId(id)).get();
    }
}
