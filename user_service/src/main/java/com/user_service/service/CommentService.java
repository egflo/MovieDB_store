package com.user_service.service;

import com.movie_service.DTO.CommmentReqeust;
import com.movie_service.models.Comment;
import com.movie_service.repository.CommentRepository;
import com.movie_service.repository.MovieRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private MovieRepository movieRepository;


    public List<Comment> getCommentsByMovieId(ObjectId movieId) {
        return commentRepository.findByMovieId(movieId);
    }

    public List<Comment> getCommentsByReviewId(ObjectId id) {
        return commentRepository.findByReviewId(id);
    }

    public Comment addComment(CommmentReqeust comment) {

        Comment add = new Comment();
        add.setDate(new Date());
        add.setComment(comment.getComment());



        return commentRepository.save(add);
    }

    // Update an existing comment
    public Comment updateComment(ObjectId id, Comment updatedComment) {
        Optional<Comment> existingComment = commentRepository.findById(id);
        if (existingComment.isPresent()) {
            Comment comment = existingComment.get();
            comment.setComment(updatedComment.getComment());
            comment.setLikes(updatedComment.getLikes());
            comment.setDate(updatedComment.getDate());
            return commentRepository.save(comment);
        }
        return null;
    }

    // Delete a comment by id
    public void deleteComment(ObjectId id) {
        commentRepository.deleteById(id);
    }
}
