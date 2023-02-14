package com.movie_service.repository;


import com.movie_service.models.Movie;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("MovieRepository")
public interface MovieRepository extends MongoRepository<Movie, ObjectId> {


    Page<Movie> getMovieByTitleContainingIgnoreCase(String title, Pageable pageable);
    Optional<Movie> getMovieById(ObjectId id);
    Optional<Movie> getMovieByMovieId(String id);
    Page<Movie> findMovieByGenresContains(String genre, Pageable pageable);

    @Query(value = "{ 'cast.castId' : ?0 }")
    Page<Movie> findMovieByCastId (String castId, Pageable pageable);

    List<Movie> findMovieByTitleContainingIgnoreCase(String title);


    //@Query(value = "{'keywords': {'$elemMatch': {'tag_id': ?0}}}")
    @Query(value = "{'keywords.tag_id': ?0}")
    Page<Movie> getMovieByKeywordsByTagId(Integer tag_id, Pageable pageable);


}
