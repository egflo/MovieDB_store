package com.movie_service.service;


import com.movie_service.DTO.Response;
import com.movie_service.DTO.ReviewRequest;
import com.movie_service.DTO.SentimentRequest;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.Review;
import com.movie_service.models.Sentiment;
import com.movie_service.repository.ReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class ReviewService implements ReviewServiceImp {

    @Autowired
    private ReviewRepository repository;


    @Override
    public Review getReview(String id) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        return repository.findById(new ObjectId(id)).get();
    }

    @Override
    public Review createReview(ReviewRequest reviewRequest) {
        Review review = new Review();
        review.setMovieId(reviewRequest.movieId());
        review.setRating(reviewRequest.rating());
        review.setSentiment(reviewRequest.sentiment());
        review.setText(reviewRequest.content());
        review.setTitle(reviewRequest.title());
        review.setDate(new Date().toString());

        return repository.save(review);
    }

    @Override
    public Review updateReview(String id, ReviewRequest reviewRequest) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        Review review = repository.findById(new ObjectId(id)).get();
        review.setMovieId(reviewRequest.movieId());
        review.setRating(reviewRequest.rating());
        review.setSentiment(reviewRequest.sentiment());
        review.setText(reviewRequest.content());
        review.setTitle(reviewRequest.title());
        review.setDate(new Date().toString());

        return repository.save(review);
    }

    @Override
    public void deleteReview(String id) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        repository.deleteById(new ObjectId(id));
    }

    @Override
    public Page<Review> getAllReviews(PageRequest pageRequest) {
        return repository.findAll(pageRequest);
    }

    @Override
    public Page<Review> getReviewsByMovieId(String movieId, PageRequest pageRequest) {
        return repository.findReviewByMovieId(movieId, pageRequest);
    }

    @Override
    public Page<Review> findByTitleContainingIgnoreCase(String title, PageRequest pageRequest) {
        return repository.findByTitleContainingIgnoreCase(title, pageRequest);
    }

    @Override
    public Page<Review> findByMovieId(String movieId, PageRequest pageRequest) {
        return repository.findReviewByMovieId(movieId, pageRequest);
    }
}
