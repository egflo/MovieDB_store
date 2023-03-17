package com.movie_service.service;


import com.movie_service.DTO.ReviewRequest;
import com.movie_service.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface ReviewServiceImp {

    Review getReview(String id);

    Review createReview(ReviewRequest reviewRequest);

    void deleteReview(String id);

    Review updateReview(String id, ReviewRequest reviewRequest);

    Page<Review> getAllReviews(PageRequest pageRequest);

    Page<Review> getReviewsByMovieId(String movieId, PageRequest pageRequest);

    Page<Review> findByTitleContainingIgnoreCase(String title, PageRequest pageRequest);

    Page<Review> findByMovieId(String movieId, PageRequest pageRequest);

}
