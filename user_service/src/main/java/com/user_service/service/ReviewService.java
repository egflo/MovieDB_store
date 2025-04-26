package com.user_service.service;


import com.user_service.DTO.ReviewDTO;
import com.user_service.DTO.ReviewRequest;
import com.user_service.exception.IdNotFoundException;
import com.user_service.grpc.MovieService;
import com.user_service.models.*;
import com.user_service.repository.ReviewRepository;
import com.user_service.repository.SentimentRepository;
import org.bson.types.ObjectId;
import org.proto.grpc.MovieResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Optional;

@Service
public class ReviewService implements ReviewServiceImp {

    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository repository;

    private  final MovieService movieService;

    private final FirebaseService firebaseService;

    private final SentimentRepository sentimentService;


    ReviewService(ReviewRepository repository, MovieService movieService, FirebaseService firebaseService, SentimentRepository sentimentService) {
        this.repository = repository;
        this.movieService = movieService;
        this.firebaseService = firebaseService;
        this.sentimentService = sentimentService;
    }

    @Override
    public ReviewDTO getReview(String id, Optional<String> userId) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        ReviewDTO review = new ReviewDTO(repository.findById(new ObjectId(id)).get());
        if(userId.isPresent()) {
            Optional<Sentiment> sentiment = sentimentService.getSentimentByUserIdAndObjectId(userId.get(), new ObjectId(id));
            sentiment.ifPresent(value -> review.setSentiment(sentiment.get()));
        }

        return review;
    }

    @Override
    public ReviewDTO createReview(ReviewRequest reviewRequest) {
        //Logg request
        logger.info("Creating review for movie: " + reviewRequest.movieId() + " with rating: " + reviewRequest.rating());
        Review review = new Review(reviewRequest);

        logger.info("Getting movie data for movie: " + reviewRequest.movieId());
        MovieResponse movie = movieService.getMovie(reviewRequest.movieId());
        Movie m = new Movie(movie);
        review.setMovie(m);

        //Get user data
        logger.info("Getting user data for user: " + reviewRequest.getUserId());
        User user = firebaseService.getUser(reviewRequest.getUserId());
        UserMeta userMeta = new UserMeta(user);
        review.setUser(userMeta);

        Review savedReview = repository.save(review);
        logger.info("Review created with id: " + savedReview.getId());

        return new ReviewDTO(savedReview);
    }

    @Override
    public ReviewDTO updateReview(String id, ReviewRequest reviewRequest) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }

        Review review = repository.findById(new ObjectId(id)).get();
        review.setRating(reviewRequest.rating());
        review.setLove(reviewRequest.love());
        review.setContent(reviewRequest.content());
        review.setTitle(reviewRequest.title());
        review.setDate(new Date());

        Review updatedReview = repository.save(review);
        ReviewDTO reviewDTO = new ReviewDTO(updatedReview);
        Optional<Sentiment> sentiment = sentimentService.getSentimentByUserIdAndObjectId(reviewRequest.getUserId(), new ObjectId(id));
        sentiment.ifPresent(value -> reviewDTO.setSentiment(sentiment.get()));

        return reviewDTO;
    }

    @Override
    public void deleteReview(String id) {
        if (!repository.existsById(new ObjectId(id))) {
            throw new IdNotFoundException("Review with id " + id + " not found");
        }
        repository.deleteById(new ObjectId(id));
    }

    @Override
    public Page<ReviewDTO> getAllReviews(
            Optional<String> userId,
            PageRequest pageRequest) {

        //If userId is present, get sentiment for each review
        return userId.map(s -> repository.findAll(pageRequest)
                .map(review -> {
                    ReviewDTO reviewDTO = new ReviewDTO(review);
                    Optional<Sentiment> sentiment = sentimentService.getSentimentByUserIdAndObjectId(s, review.getId());
                    sentiment.ifPresent(value -> reviewDTO.setSentiment(sentiment.get()));
                    return reviewDTO;
                })).orElseGet(() -> repository.findAll(pageRequest)
                .map(ReviewDTO::new));
    }

    @Override
    public Page<ReviewDTO> findByTitleContainingIgnoreCase(String title,
                                                           Optional<String> userId,
                                                           PageRequest pageRequest) {

        return userId.map(s -> repository.findByTitleContainingIgnoreCase(title, pageRequest)
                .map(review -> {
                    ReviewDTO reviewDTO = new ReviewDTO(review);
                    Optional<Sentiment> sentiment = sentimentService.getSentimentByUserIdAndObjectId(s, review.getId());
                    sentiment.ifPresent(value -> reviewDTO.setSentiment(sentiment.get()));
                    return reviewDTO;
                })).orElseGet(() -> repository.findByTitleContainingIgnoreCase(title, pageRequest)
                .map(ReviewDTO::new));
    }

    @Override
    public Page<ReviewDTO> findByMovieId(String movieId,
                                         Optional<String> userId,
                                         PageRequest pageRequest) {

        return userId.map(s -> repository.findAllByMovieId(new ObjectId(movieId), pageRequest)
                .map(review -> {
                    ReviewDTO reviewDTO = new ReviewDTO(review);
                    Optional<Sentiment> sentiment = sentimentService.getSentimentByUserIdAndObjectId(s, review.getId());
                    sentiment.ifPresent(value -> reviewDTO.setSentiment(sentiment.get()));
                    return reviewDTO;
                })).orElseGet(() -> repository.findAllByMovieId(new ObjectId(movieId), pageRequest)
                .map(ReviewDTO::new));

    }
}
