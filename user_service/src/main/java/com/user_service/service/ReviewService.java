package com.user_service.service;


import com.movie_service.DTO.ReviewRequest;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.UserReview;
import com.movie_service.repository.ReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class ReviewService implements ReviewServiceImp {

    @Autowired
    private ReviewRepository repository;


    @Override
    public UserReview getReview(String id) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        return repository.findById(new ObjectId(id)).get();
    }

    @Override
    public UserReview createReview(ReviewRequest reviewRequest) {
        UserReview review = new UserReview();
        review.setMovieId(reviewRequest.movieId());
        review.setRating(reviewRequest.rating());
        review.setSentiment(reviewRequest.sentiment());
        review.setContent(reviewRequest.content());
        review.setTitle(reviewRequest.title());
        review.setDate(new Date());

        return repository.save(review);
    }

    @Override
    public UserReview updateReview(String id, ReviewRequest reviewRequest) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        UserReview review = repository.findById(new ObjectId(id)).get();
        review.setRating(reviewRequest.rating());
        review.setSentiment(reviewRequest.sentiment());
        review.setContent(reviewRequest.content());
        review.setTitle(reviewRequest.title());
        review.setDate(new Date());

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
    public Page<UserReview> getAllReviews(PageRequest pageRequest) {
        return repository.findAll(pageRequest);
    }

    @Override
    public Page<UserReview> getReviewsByMovieId(String movieId, PageRequest pageRequest) {
        return repository.findReviewByMovieId(movieId, pageRequest);
    }

    @Override
    public Page<UserReview> findByTitleContainingIgnoreCase(String title, PageRequest pageRequest) {
        return repository.findByTitleContainingIgnoreCase(title, pageRequest);
    }

    @Override
    public Page<UserReview> findByMovieId(String movieId, PageRequest pageRequest) {
        return repository.findReviewByMovieId(movieId, pageRequest);
    }
}
