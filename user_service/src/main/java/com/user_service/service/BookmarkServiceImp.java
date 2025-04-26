package com.user_service.service;

import com.user_service.DTO.BookmarkDTO;
import com.user_service.DTO.BookmarkRequest;
import com.user_service.models.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookmarkServiceImp {

    BookmarkDTO getBookmark(String id);

    Page<BookmarkDTO> getBookmarksByUserId(String userId, Pageable pageable);

    BookmarkDTO addBookmark(BookmarkRequest bookmark);

    void deleteBookmark(String id);

    Page<BookmarkDTO> getBookmarksByMovieId(String movieId, Pageable pageable);

    Page<BookmarkDTO> getBookmarksByCreatedAfter(String date, Pageable pageable);

    Page<BookmarkDTO> getBookmarks(Pageable pageable);

    BookmarkDTO updateBookmark(String id, BookmarkRequest bookmark);

    BookmarkDTO getByMovieIdAndUserId(String movieId, String userId);
}
