package com.movie_service.service;


import com.movie_service.DTO.Response;
import com.movie_service.DTO.SentimentRequest;
import com.movie_service.models.Review;
import com.movie_service.models.Sentiment;
import com.movie_service.repository.ReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository repository;

    @Autowired
    private SentimentService service;



    public Page<Review> findAll(Pageable pageable) {
        Page<Review> cast = repository.findAll(pageable);
        return cast;
    }

    public Page<Review> findByTitle(String name, Pageable pageable) {
        return repository.getReviewByTitleContaining(name, pageable);
    }

    public Optional<Review> findById(String id) {
        return repository.findById(new ObjectId(id));
    }

    public Page<Review> findByMovieId(String id, Pageable pageable) {
        return repository.findReviewByMovieId(id, pageable);
    }



    public Response rateReview(SentimentRequest request) {

        return service.save(request);
    }

}
