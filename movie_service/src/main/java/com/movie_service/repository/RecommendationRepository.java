package com.movie_service.repository;

import com.movie_service.models.Recommendation;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("RecommendationRepository")
public interface RecommendationRepository extends MongoRepository<Recommendation, ObjectId> {

    Optional<Recommendation> findByMovieId(String movieId);
}
