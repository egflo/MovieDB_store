package com.movie_service.repository;

import com.movie_service.models.MetacriticUserReview;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository("MetacriticUserReviewRepository")
public interface MetacriticUserReviewRepository extends MongoRepository<MetacriticUserReview, ObjectId> {

    Page<MetacriticUserReview> findByMovieId(String movieId, Pageable pageable);

    long countByMovieId(String movieId);
}
