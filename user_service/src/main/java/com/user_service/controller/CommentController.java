package com.user_service.controller;

import com.user_service.DTO.CommentDTO;
import com.user_service.DTO.CommentReqeust;
import com.user_service.models.Comment;
import com.user_service.service.CommentService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Get comments for a specific movie
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getCommentsByMovieId(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @PathVariable String movieId,
            @RequestParam Optional<String> sortBy)
    {
        List<CommentDTO> comments = commentService.getCommentsByMovieId(
                movieId,
                userId,
                sortBy.orElse("date"));
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<?> getCommentsByReviewId(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @PathVariable String reviewId,
            @RequestParam Optional<String> sortBy)
    {
        List<CommentDTO> comments = commentService.getCommentsByReview(
                reviewId,
                userId,
                sortBy.orElse("date"));
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    // Add a new comment
    @PutMapping("/")
    public ResponseEntity<Comment> addComment(@RequestHeader("uid") String subject,
                                              @RequestBody CommentReqeust comment) {

        Comment newComment = commentService.addComment(subject, comment);
        return new ResponseEntity<>(newComment, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCommentById(
            @RequestHeader(value = "uid", required = false) Optional<String> userId,
            @PathVariable String id) {
        CommentDTO comment = commentService.getCommentById(id, userId);
        return new ResponseEntity<>(comment,HttpStatus.OK);
    }

    // Update a comment
    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(
            @RequestHeader(value = "uid", required = true) String subject,
            @PathVariable String id,
            @RequestBody Comment updatedComment) {

        Comment comment = commentService.updateComment(new ObjectId(id), updatedComment);
        if (comment != null) {
            return new ResponseEntity<>(comment, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // Delete a comment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@RequestHeader("uid") String subject, @PathVariable String id) {
        commentService.deleteComment(new ObjectId(id));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
