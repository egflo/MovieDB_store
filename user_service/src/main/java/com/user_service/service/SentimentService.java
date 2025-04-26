package com.user_service.service;

import com.user_service.DTO.SentimentDTO;
import com.user_service.DTO.SentimentRequest;
import com.user_service.exception.IdNotFoundException;
import com.user_service.models.Sentiment;
import com.user_service.models.Status;
import com.user_service.repository.SentimentRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.convert.ConversionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<SentimentDTO> findByCreatedAfter(String date, Pageable pageable) {
        return repository.getSentimentByCreatedAfter(new Date(date), pageable)
                .map(SentimentDTO::new);
    }

    @Override
    public Integer countSentimentByObjectIdAndStatus(String id, String status) {
        return repository.countSentimentByObjectIdAndStatus(id, status);
    }

    @Override
    public Optional<SentimentDTO> findByUserIdAndObjectId(String userId, String objectId) {
        return repository.getSentimentByUserIdAndObjectId(userId, new ObjectId(objectId))
                .map(SentimentDTO::new);
    }

    @Override
    public SentimentDTO findByObjectId(String subject, String id) {
        Optional<Sentiment> item = repository.getSentimentByUserIdAndObjectId(subject, new ObjectId(id));

        if(item.isPresent()) {
            return new SentimentDTO(item.get());
        }

        throw new IdNotFoundException("Sentiment not found with id: " + id);
    }

    @Override
    public SentimentDTO getSentiment(String id) {
        if (repository.findById(new ObjectId(id)).isPresent()) {
            return repository.findById(new ObjectId(id))
                    .map(SentimentDTO::new)
                    .get();
        }
        throw new IdNotFoundException("Sentiment not found with id: " + id);
    }


    @Override
    public SentimentDTO createSentiment(SentimentRequest request) {
        Optional<Sentiment> present = repository.getSentimentByUserIdAndObjectId(request.getUserId(), new ObjectId(request.getObjectId()));
        if (present.isPresent()) {
            Sentiment sentiment = present.get();
            //String to Enum
            Status status = conversionService.convert(request.getStatus(), Status.class);
            sentiment.setStatus(status);
            return new SentimentDTO(repository.save(sentiment));
        }

        Sentiment sentiment = new Sentiment();
        sentiment.setUserId(request.getUserId());
        sentiment.setObjectId(new ObjectId(request.getObjectId()));
        //String to Enum
        sentiment.setStatus(conversionService.convert(request.getStatus(), Status.class));
        sentiment.setCreated(new Date());

        if (request.getDate() != null) {
            sentiment.setCreated(new Date(request.getDate()));
        }

        return new SentimentDTO(repository.save(sentiment));
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
    public SentimentDTO updateSentiment(String id, SentimentRequest sentiment) {
        return createSentiment(sentiment);
    }

    @Override
    public Page<SentimentDTO> getSentimentByObjectId(String objectId, Pageable pageRequest) {
        return repository.getSentimentByObjectId(new ObjectId(objectId), pageRequest)
                .map(SentimentDTO::new);
    }

    @Override
    public Page<SentimentDTO> getSentimentByUserId(String userId, Pageable pageRequest) {
        return repository.getSentimentByUserId(userId, pageRequest)
                .map(SentimentDTO::new);
    }
    @Override
    public Page<SentimentDTO> getAllSentiments(Pageable pageRequest) {
        return repository.findAll(pageRequest)
                .map(SentimentDTO::new);
    }


}
