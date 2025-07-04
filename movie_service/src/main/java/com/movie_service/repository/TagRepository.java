package com.movie_service.repository;


import com.movie_service.models.Suggestion;
import com.movie_service.models.Tag;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository("TagRepository")

public interface TagRepository extends MongoRepository<Tag, ObjectId> {

    List<Tag> findByName(String tagName);

    List<Tag> findByNameIn(List<String> tagNames);

    Page<Tag> findByNameIn(List<String> tagNames, Pageable pageable);

}
