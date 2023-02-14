package com.movie_service.repository;


import com.movie_service.models.Suggestion;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("SuggestionsRepository")

public interface SuggestionRepository extends MongoRepository<Suggestion, ObjectId> {

    List<Suggestion> findSuggestionByMovieId(String movieId);

    Page<Suggestion> findSuggestionByMovieId(String movieId, Pageable pageable);
}
