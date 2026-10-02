package com.movie_service.repository;

import com.movie_service.models.IMDBReview;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository("IMDBReviewRepository")
public interface IMDBReviewRepository extends MongoRepository<IMDBReview, ObjectId> {

    Page<IMDBReview> findByMovieId(String movieId, Pageable pageable);

    long countByMovieId(String movieId);
}
