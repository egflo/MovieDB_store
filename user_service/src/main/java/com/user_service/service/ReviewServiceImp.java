package com.user_service.service;


import com.movie_service.DTO.ReviewRequest;
import com.movie_service.models.UserReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface ReviewServiceImp {

    UserReview getReview(String id);

    UserReview createReview(ReviewRequest reviewRequest);

    void deleteReview(String id);

    UserReview updateReview(String id, ReviewRequest reviewRequest);

    Page<UserReview> getAllReviews(PageRequest pageRequest);

    Page<UserReview> getReviewsByMovieId(String movieId, PageRequest pageRequest);

    Page<UserReview> findByTitleContainingIgnoreCase(String title, PageRequest pageRequest);

    Page<UserReview> findByMovieId(String movieId, PageRequest pageRequest);

}
