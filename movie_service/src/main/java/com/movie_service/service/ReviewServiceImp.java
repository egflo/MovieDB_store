package com.movie_service.service;


import com.movie_service.DTO.CriticReviewDTO;
import com.movie_service.DTO.ReviewCounts;
import com.movie_service.DTO.UserReviewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;

public interface ReviewServiceImp {

    Page<CriticReviewDTO> getCriticReviews(String source, String movieId, int page, int limit, String sortBy, Sort.Direction direction);

    Page<UserReviewDTO> getUserReviews(String source, String movieId, int page, int limit, String sortBy, Sort.Direction direction);

    ReviewCounts countReviews(String movieId);

}
