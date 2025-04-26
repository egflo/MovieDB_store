package com.user_service.repository;

import com.user_service.models.Comment;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, ObjectId> {
    // Custom query methods can be added here
    List<Comment> findByMovieId(ObjectId movieId, Sort sort);

    List<Comment> findByReviewId(ObjectId reviewId, Sort sort);

   // List<Comment> findAllByReview(ObjectId id);
}

