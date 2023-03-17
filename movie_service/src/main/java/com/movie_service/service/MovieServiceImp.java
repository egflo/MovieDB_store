package com.movie_service.service;

import com.movie_service.models.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.HashMap;

public interface MovieServiceImp {
    Page<Movie> findAll(Pageable pageable);

    Movie getMovie(String id);

    Movie findByMovieId(String movieId);

    Page<Movie> findByTitle(String title, Pageable pageable);

    Page<Movie> getSuggestions(String movieId, Pageable pageable);

    Page<Movie> findMoviesByCriteria(String title, HashMap<String, String[]> criteria, Pageable pageable);

    Page<Movie> getMoviesByTagId(Integer tagId, Pageable pageable);

    Page<Movie> recommendMovies(String movieId, Pageable pageable);

    Page<Movie> findMovieByCastId(String castId, Pageable pageable);


    Page<Movie> getBookmarks(String userId, Pageable pageable);
}
