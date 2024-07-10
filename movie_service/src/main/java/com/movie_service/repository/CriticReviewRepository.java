package com.movie_service.repository;


import com.movie_service.models.CriticReview;
import com.movie_service.models.Review;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("CriticReviewRepository")

public interface CriticReviewRepository extends MongoRepository<CriticReview, ObjectId> {

    Optional<CriticReview> findReviewById(ObjectId id);
    Page<CriticReview> findReviewByMovieId(String movie_id, Pageable pageable);

}
