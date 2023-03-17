package com.movie_service.service;

import com.movie_service.DTO.BookmarkRequest;
import com.movie_service.models.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface BookmarkServiceImp {

    Bookmark getBookmark(String id);

    Page<Bookmark> getBookmarksByUserId(String userId, Pageable pageable);

    Bookmark addBookmark(BookmarkRequest bookmark);

    void deleteBookmark(String id);

    Page<Bookmark> getBookmarksByMovieId(String movieId, Pageable pageable);

    Page<Bookmark> getBookmarksByCreatedAfter(String date, Pageable pageable);

    Page<Bookmark> getBookmarks(Pageable pageable);

    Bookmark updateBookmark(String id, BookmarkRequest bookmark);

    Bookmark getByMovieIdAndUserId(String movieId, String userId);
}
