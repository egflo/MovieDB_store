package com.movie_service.service;


import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.movie_service.DAO.MovieDAO;
import com.movie_service.DTO.ItemDTO;
import com.movie_service.DTO.MovieDTO;
import com.movie_service.DTO.Response;
import com.movie_service.DTO.SentimentRequest;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.grpc.ItemService;
import com.movie_service.models.Bookmark;
import com.movie_service.models.Movie;
import com.movie_service.models.Suggestion;
import com.movie_service.repository.BookmarkRepository;
import com.movie_service.repository.MovieRepository;
import com.movie_service.repository.SuggestionRepository;
import org.apache.commons.io.IOUtils;
import org.bson.types.ObjectId;
import org.proto.grpc.ItemResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;

@Service
public class MovieService implements MovieServiceImp {

    @Autowired
    MovieDAO movieDAO;

    @Autowired
    private MovieRepository repository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private SuggestionRepository suggestionRepository;

    @Autowired
    private ItemService itemService;


    @Override
    public Page<Movie> findAll(Pageable pageable) {
        Page<Movie> movies = repository.findAll(pageable);
        return movies;
    }


    @Override
    public Movie findByMovieId(String id) {
        API api = new API(repository);
        api.background(id);
        Optional<Movie> movie = repository.getMovieByMovieId(id);
        if (movie.isPresent()) {
            return movie.get();
        }

        throw new IdNotFoundException("Movie with id " + id + " not found");
    }

    @Override
    public Page<Movie> findByTitle(String title, Pageable pageable) {
        return repository.getMovieByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    public Page<Movie> findMovieByCastId(String castId, Pageable pageable) {
        return repository.findMovieByCastId(castId, pageable);
    }

    @Override
    public Page<Movie> getBookmarks(String userId, Pageable pageable) {
        Page<Bookmark> bookmarks = bookmarkRepository.getBookmarkByUserId(userId, pageable);

        List<Movie> movies = new ArrayList<>(bookmarks.map(Bookmark::getMovie).getContent());
        return new PageImpl<>(movies, pageable, bookmarks.getTotalElements());

    }


    @Override
    public Page<Movie> recommendMovies(String movieId, Pageable pageable) {
        Optional<Movie> movie = repository.getMovieByMovieId(movieId);
        if (movie.isPresent()) {
            List<String> genres = movie.get().getGenres();
            return repository.findMovieByGenresContains(genres.get(0), pageable);
        }
        throw new IdNotFoundException("Movie with id " + movieId + " not found");
    }


    @Override
    public Page<Movie> getMoviesByTagId(Integer tagId, Pageable pageable) {
        return repository.getMovieByKeywordsByTagId(tagId, pageable);
    }

    @Override
    public Page<Movie> findMoviesByCriteria(String title, HashMap<String, String[]> criteria, Pageable pageable) {
        return movieDAO.findMovieByParams(title, criteria, pageable);
    }

    @Override
    public Movie getMovie(String id) {
        Optional<Movie> movie = repository.findById(new ObjectId(id));
        if (movie.isPresent()) {
            return movie.get();
        }

        throw new IdNotFoundException("Movie with id " + id + " not found");

    }

    @Override
    public Page<Movie> getSuggestions(String movieId, Pageable pageable) {
        Page<Suggestion> suggestions =
                suggestionRepository.findSuggestionByMovieId(movieId, pageable);

        List<Movie> movies = new ArrayList<>();

        for(Suggestion suggest : suggestions.getContent()) {

            Optional<Movie> movie = repository.getMovieByMovieId(suggest.getSugMovieId());
            if (movie.isPresent()) {
                movies.add(movie.get());
            }
        }

        return new PageImpl<>(movies, pageable, suggestions.getTotalElements());
    }
}

