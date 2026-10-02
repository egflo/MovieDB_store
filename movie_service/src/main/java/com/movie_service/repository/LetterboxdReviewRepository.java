package com.movie_service.repository;

import com.movie_service.models.LetterboxdReview;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository("LetterboxdReviewRepository")
public interface LetterboxdReviewRepository extends MongoRepository<LetterboxdReview, ObjectId> {

    Page<LetterboxdReview> findByMovieId(String movieId, Pageable pageable);

    long countByMovieId(String movieId);
}
