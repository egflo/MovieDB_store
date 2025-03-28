package com.user_service.repository;


import com.movie_service.models.UserReview;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("ReviewRepository")

public interface ReviewRepository extends MongoRepository<UserReview, ObjectId> {

    Page<UserReview> getReviewByTitleContaining(String name, Pageable pageable);
    Page<UserReview> getReviewByDateAfter(String date, Pageable pageable);
    Optional<UserReview> findReviewById(ObjectId id);
    Page<UserReview> findReviewByMovieId(String id, Pageable pageable);
    Page<UserReview> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
