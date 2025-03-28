package com.user_service.repository;


import com.user_service.models.Bookmark;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository("BookmarkRepository")

public interface BookmarkRepository extends MongoRepository<Bookmark, ObjectId> {

    Page<Bookmark> getBookmarkByUserId(String id, Pageable pageable);
    Page<Bookmark> findBookmarkByCreatedAfter(String date, Pageable pageable);
    Optional<Bookmark> findBookmarkById(ObjectId id);
    Page<Bookmark> findBookmarkByMovie_Id(String id, Pageable pageable);

    void deleteBookmarkByMovie_Id(String id);

    void deleteBookmarkByUserId(String id);

    Optional<Bookmark> getBookmarkByMovie_IdAndUserId(ObjectId id, String userId);

}
