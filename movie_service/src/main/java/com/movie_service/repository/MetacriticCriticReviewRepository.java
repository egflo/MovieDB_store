package com.movie_service.repository;

import com.movie_service.models.MetacriticCriticReview;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository("MetacriticCriticReviewRepository")
public interface MetacriticCriticReviewRepository extends MongoRepository<MetacriticCriticReview, ObjectId> {

    Page<MetacriticCriticReview> findByMovieId(String movieId, Pageable pageable);

    long countByMovieId(String movieId);
}
