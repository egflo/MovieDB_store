package com.movie_service.controller;

import com.movie_service.DTO.CommmentReqeust;
import com.movie_service.models.Comment;
import com.movie_service.service.CommentService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Get comments for a specific movie
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<Comment>> getCommentsByMovieId(@PathVariable ObjectId movieId) {
        List<Comment> comments = commentService.getCommentsByMovieId(movieId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<Comment>> getCommentsByReviewId(@PathVariable ObjectId reviewId) {
        List<Comment> comments = commentService.getCommentsByReviewId(reviewId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    // Add a new comment
    @PostMapping
    public ResponseEntity<Comment> addComment(@RequestBody CommmentReqeust comment) {
        Comment newComment = commentService.addComment(comment);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }

    // Update a comment
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable ObjectId id, @RequestBody Comment updatedComment) {
        Comment comment = commentService.updateComment(id, updatedComment);
        if (comment != null) {
            return new ResponseEntity<>(comment, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable ObjectId id) {
        commentService.deleteComment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
