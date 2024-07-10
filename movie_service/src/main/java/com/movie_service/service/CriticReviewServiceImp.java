package com.movie_service.service;


import com.movie_service.DTO.ReviewRequest;
import com.movie_service.models.CriticReview;
import com.movie_service.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

public interface CriticReviewServiceImp {

    CriticReview getReview(String id);

    void deleteReview(String id);

    Page<CriticReview> getAllReviews(PageRequest pageRequest);

    Page<CriticReview> getReviewsByMovieId(String movieId, PageRequest pageRequest);


    Page<CriticReview> findByMovieId(String movieId, PageRequest pageRequest);

}
