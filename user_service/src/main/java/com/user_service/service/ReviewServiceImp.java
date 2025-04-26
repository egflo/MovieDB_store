package com.user_service.service;


import com.user_service.DTO.ReviewDTO;
import com.user_service.DTO.ReviewRequest;
import com.user_service.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

public interface ReviewServiceImp {

    ReviewDTO getReview(String id, Optional<String> userId);

    ReviewDTO createReview(ReviewRequest reviewRequest);

    void deleteReview(String id);

    ReviewDTO updateReview(String id, ReviewRequest reviewRequest);

    Page<ReviewDTO> getAllReviews(Optional<String> userId, PageRequest pageRequest);

    Page<ReviewDTO> findByTitleContainingIgnoreCase(String title, Optional<String> userId, PageRequest pageRequest);

    Page<ReviewDTO> findByMovieId(String movieId, Optional<String> userId, PageRequest pageRequest);

}
