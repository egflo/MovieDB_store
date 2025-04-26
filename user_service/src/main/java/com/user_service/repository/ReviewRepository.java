package com.user_service.repository;


import com.user_service.models.Review;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("ReviewRepository")
public interface ReviewRepository extends MongoRepository<Review, ObjectId> {
    Page<Review> getReviewByTitleContaining(String name, Pageable pageable);
    Page<Review> getReviewByDateAfter(String date, Pageable pageable);
    Optional<Review> findReviewById(ObjectId id);
    Page<Review> findReviewByMovieId(String id, Pageable pageable);
    Page<Review> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Review> findAllByMovieId(ObjectId id, Pageable pageable);
}
