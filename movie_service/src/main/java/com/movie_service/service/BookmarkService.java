package com.movie_service.service;


import com.movie_service.DTO.BookmarkRequest;
import com.movie_service.DTO.Response;
import com.movie_service.exception.IdNotFoundException;
import com.movie_service.models.Bookmark;
import com.movie_service.models.Movie;
import com.movie_service.repository.BookmarkRepository;
import com.movie_service.repository.MovieRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.xml.crypto.Data;
import java.util.Date;
import java.util.Optional;

@Service
public class BookmarkService implements BookmarkServiceImp {

    @Autowired
    private BookmarkRepository repository;

    @Autowired
    private MovieRepository movieRepository;

    @Override
    public Bookmark getBookmark(String id) {
        Optional<Bookmark> bookmark = repository.findById(new ObjectId(id));
        if (bookmark.isPresent()) {
            return bookmark.get();
        }

        throw new IdNotFoundException("Bookmark not found");
    }

    @Override
    public Page<Bookmark> getBookmarksByUserId(String userId, Pageable pageable) {
        return repository.getBookmarkByUserId(userId, pageable);
    }

    @Override
    public Bookmark addBookmark(BookmarkRequest bookmark) {
        Optional<Movie> movie = movieRepository.getMovieById(new ObjectId(bookmark.getMovieId()));
        Optional<Bookmark> bookmarkOptional = repository.getBookmarkByMovie_IdAndUserId(new ObjectId(bookmark.getMovieId()), bookmark.getUserId());

        if (bookmarkOptional.isPresent()) {
            Bookmark newBookmark = bookmarkOptional.get();
            newBookmark.setCreated(new Date());
            return repository.save(newBookmark);
        }

        if (movie.isPresent()) {
            Bookmark newBookmark = new Bookmark();
            newBookmark.setMovie(movie.get());
            newBookmark.setUserId(bookmark.getUserId());
            newBookmark.setCreated(new Date());
            return repository.save(newBookmark);
        }

        throw new IdNotFoundException("Movie not found");
    }

    @Override
    public void deleteBookmark(String id) {
        Optional<Bookmark> bookmark = repository.findById(new ObjectId(id));
        if (bookmark.isPresent()) {
            repository.delete(bookmark.get());
            return;
        }

        throw new IdNotFoundException("Bookmark not found");

    }

    @Override
    public Page<Bookmark> getBookmarksByMovieId(String movieId, Pageable pageable) {
        return repository.findBookmarkByMovie_Id(movieId, pageable);
    }

    @Override
    public Page<Bookmark> getBookmarksByCreatedAfter(String date, Pageable pageable) {
        return repository.findBookmarkByCreatedAfter(date, pageable);
    }

    @Override
    public Page<Bookmark> getBookmarks(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    public Bookmark updateBookmark(String id, BookmarkRequest bookmark) {
        Optional<Bookmark> bookmarkOptional = repository.findById(new ObjectId(id));
        if (bookmarkOptional.isPresent()) {
            Bookmark newBookmark = bookmarkOptional.get();
            newBookmark.setUserId(bookmark.getUserId());
            newBookmark.setCreated(new Date());
            return repository.save(newBookmark);
        }

        throw new IdNotFoundException("Bookmark not found");
    }

    @Override
    public Bookmark getByMovieIdAndUserId(String movieId, String userId) {
        Optional<Bookmark> bookmark = repository.getBookmarkByMovie_IdAndUserId(new ObjectId(movieId), userId);
        if (bookmark.isPresent()) {
            return bookmark.get();
        }

        throw new IdNotFoundException("Bookmark not found");
    }

    public Optional<Bookmark> getBookmarkByMovieIdAndUserId(String movieId, String userId) {
        return repository.getBookmarkByMovie_IdAndUserId(new ObjectId(movieId), userId);
    }

    public void deleteBookmarkByMovieIdAndUserId(String movieId, String userId) {
        Optional<Bookmark> bookmark = repository.getBookmarkByMovie_IdAndUserId(new ObjectId(movieId), userId);
        if (bookmark.isPresent()) {
            repository.delete(bookmark.get());
            return;
        }

        throw new IdNotFoundException("Bookmark not found");
    }
}
