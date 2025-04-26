package com.user_service.service;

import com.user_service.DTO.BookmarkDTO;
import com.user_service.DTO.BookmarkRequest;
import com.user_service.exception.IdNotFoundException;
import com.user_service.grpc.MovieService;
import com.user_service.models.Bookmark;
import com.user_service.models.Movie;
import com.user_service.models.User;
import com.user_service.repository.BookmarkRepository;
import org.bson.types.ObjectId;
import org.proto.grpc.MovieResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class BookmarkService implements BookmarkServiceImp {

    private static final Logger logger = Logger.getLogger("BookmarkService");

    private final BookmarkRepository repository;
    private final MovieService movieService;

    public BookmarkService(BookmarkRepository repository,
                           MovieService movieService) {
        this.repository = repository;
        this.movieService = movieService;
    }

    @Override
    public BookmarkDTO getBookmark(String id) {
        Optional<Bookmark> bookmark = repository.findById(new ObjectId(id));
        if (bookmark.isPresent()) {
            return new BookmarkDTO(bookmark.get());
        }
        throw new IdNotFoundException("Bookmark not found");
    }

    @Override
    public Page<BookmarkDTO> getBookmarksByUserId(String userId, Pageable pageable) {
        return repository.getBookmarkByUserId(userId, pageable).map(BookmarkDTO::new);
    }

    @Override
    public BookmarkDTO addBookmark(BookmarkRequest request) {
        Optional<Bookmark> bookmarkOptional =
                repository.getBookmarkByMovie_IdAndUserId(new ObjectId(request.getMovieId()), request.getUserId());

        // Update existing bookmark
        // Create new bookmark and save it
        Bookmark newBookmark = bookmarkOptional.orElseGet(Bookmark::new);
        newBookmark.setUserId(request.getUserId());

        MovieResponse movie = movieService.getMovie(request.getMovieId());
        Movie m = new Movie(movie);
        newBookmark.setMovie(m);
        newBookmark.setCreated(new Date());
        return new BookmarkDTO(repository.save(newBookmark));
    }

    @Override
    public void deleteBookmark(String id) {
        Optional<Bookmark> bookmark = repository.findById(new ObjectId(id));
        bookmark.ifPresent(value -> repository.delete(value));
        //return new Response(HttpStatus.NOT_FOUND, false, "Bookmark not found", null);
        throw new IdNotFoundException("Bookmark not found");
    }

    @Override
    public Page<BookmarkDTO> getBookmarksByMovieId(String movieId, Pageable pageable) {
        return repository.findBookmarkByMovie_Id(movieId, pageable).map(BookmarkDTO::new);
    }

    @Override
    public Page<BookmarkDTO> getBookmarksByCreatedAfter(String date, Pageable pageable) {
        return repository.findBookmarkByCreatedAfter(date, pageable).map(BookmarkDTO::new);
    }

    @Override
    public Page<BookmarkDTO> getBookmarks(Pageable pageable) {
        return repository.findAll(pageable).map(BookmarkDTO::new);
    }

    @Override
    public BookmarkDTO updateBookmark(String id, BookmarkRequest bookmark) {
        Optional<Bookmark> bookmarkOptional = repository.findById(new ObjectId(id));
        if (bookmarkOptional.isPresent()) {
            Bookmark newBookmark = bookmarkOptional.get();
            newBookmark.setUserId(bookmark.getUserId());
            newBookmark.setCreated(new Date());
            return new BookmarkDTO(repository.save(newBookmark));
        }

        throw new IdNotFoundException("Bookmark not found");
    }

    @Override
    public BookmarkDTO getByMovieIdAndUserId(String movieId, String userId) {
        Optional<Bookmark> bookmark = repository.getBookmarkByMovie_IdAndUserId(new ObjectId(movieId), userId);
        return bookmark.map(BookmarkDTO::new).orElse(null);

    }

    public Optional<BookmarkDTO> getBookmarkByMovieIdAndUserId(String movieId, String userId) {
        return repository.getBookmarkByMovie_IdAndUserId(new ObjectId(movieId), userId).map(BookmarkDTO::new);
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
