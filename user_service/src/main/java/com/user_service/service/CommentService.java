package com.user_service.service;


import com.user_service.DTO.*;
import com.user_service.exception.IdNotFoundException;
import com.user_service.grpc.MovieService;
import com.user_service.models.*;
import com.user_service.repository.CommentRepository;
import com.user_service.repository.ReviewRepository;
import com.user_service.repository.SentimentRepository;
import org.bson.types.ObjectId;
import org.proto.grpc.MovieResponse;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    private final FirebaseService firebaseService;

    private final ReviewRepository reviewRepository;

    private final MovieService movieService;

    private final SentimentRepository sentimentRepository;

    CommentService(CommentRepository commentRepository, FirebaseService firebaseService, ReviewRepository reviewRepository, MovieService movieService, SentimentRepository sentimentService) {
        this.commentRepository = commentRepository;
        this.firebaseService = firebaseService;
        this.reviewRepository = reviewRepository;
        this.movieService = movieService;
        this.sentimentRepository = sentimentService;
    }

    public Comment addComment(String subject, CommentReqeust comment) {
        Comment add = new Comment();
        add.setText(comment.getText());
        add.setUserId(subject);

        Optional<Review> item = reviewRepository.findReviewById(new ObjectId(comment.getReviewId()));
        if(item.isEmpty()) {
            throw new IdNotFoundException("Review Not Found");
        }

        User user = firebaseService.getUser(subject);
        UserMeta meta = new UserMeta(user);
        add.setUser(meta);

        ObjectId movieId = item.get().getMovieId();
        add.setMovieId(movieId);

        MovieResponse movie = movieService.getMovie(movieId.toString());
        Movie movieMeta = new Movie(movie);
        add.setMovie(movieMeta);

        Review review = item.get();
        add.setReviewId(review.getId());
        return commentRepository.save(add);
    }

    // Update an existing comment
    public Comment updateComment(ObjectId id, Comment updatedComment) {
        Optional<Comment> existingComment = commentRepository.findById(id);
        if (existingComment.isPresent()) {
            Comment comment = existingComment.get();
            comment.setText(updatedComment.getText());
            comment.setLikes(updatedComment.getLikes());
            comment.setDate(updatedComment.getDate());
            return commentRepository.save(comment);
        }

        throw new IdNotFoundException("Comment Not Found");
    }

    public void deleteComment(ObjectId id) {
        if(commentRepository.findById(id).isEmpty()) {
            throw new IdNotFoundException("Comment Not Found");
        }

        commentRepository.deleteById(id);
    }

    public List<CommentDTO> getCommentsByReview(String reviewId, Optional<String> userId, String sortBy) {
        Sort sort = Sort.by(sortBy).descending(); // or .descending() based on your requirement
        return userId.map(s -> commentRepository.findByReviewId(new ObjectId(reviewId), sort)
                .stream()
                .map(comment -> {
                    CommentDTO commentDTO = new CommentDTO(comment);
                    Optional<Sentiment> sentiment = sentimentRepository.getSentimentByUserIdAndObjectId(s, comment.getId());
                    sentiment.ifPresent(commentDTO::setSentiment);
                    return commentDTO;
                })
                .toList())
                .orElseGet(() -> commentRepository.findByReviewId(new ObjectId(reviewId), sort)
                        .stream()
                        .map(CommentDTO::new)
                        .toList());
    }

    public List<CommentDTO> getCommentsByMovieId(String movieId, Optional<String> userId, String sortBy) {
        //Find comments by movie id and sort by date newest first
        Sort sort = Sort.by(sortBy).descending();
        return userId.map(s -> commentRepository.findByMovieId(new ObjectId(movieId), sort)
                        .stream()
                        .map(comment -> {
                            CommentDTO commentDTO = new CommentDTO(comment);
                            Optional<Sentiment> sentiment = sentimentRepository.getSentimentByUserIdAndObjectId(s, comment.getId());
                            sentiment.ifPresent(commentDTO::setSentiment);
                            return commentDTO;
                        })
                        .toList())
                .orElseGet(() -> commentRepository.findByMovieId(new ObjectId(movieId), sort)
                        .stream()
                        .map(CommentDTO::new)
                        .toList());

    }

    public CommentDTO getCommentById(String id, Optional<String> userId) {
        Optional<Comment> comment= commentRepository.findById(new ObjectId(id));
        if(comment.isEmpty()) {
            throw new IdNotFoundException("Comment Not Found");
        }

        CommentDTO commentDTO = new CommentDTO(comment.get());
        userId.ifPresent(s -> {
            Optional<Sentiment> sentiment = sentimentRepository.getSentimentByUserIdAndObjectId(s, new ObjectId(id));
            sentiment.ifPresent(commentDTO::setSentiment);
        });
        return commentDTO;
    }

}
