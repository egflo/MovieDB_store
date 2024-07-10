package com.movie_service.service;


import com.movie_service.models.CriticReview;
import com.movie_service.models.Review;
import com.movie_service.repository.CriticReviewRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class CriticReviewService implements CriticReviewServiceImp {

    @Autowired
    private CriticReviewRepository repository;

    @Override
    public CriticReview getReview(String id) {
        ObjectId objectId = new ObjectId(id);
        return repository.findReviewById(objectId).orElse(null);
    }

    @Override
    public void deleteReview(String id) {
        ObjectId objectId = new ObjectId(id);
        repository.deleteById(objectId);
    }

    @Override
    public Page<CriticReview> getAllReviews(PageRequest pageRequest) {
        return repository.findAll(pageRequest);
    }

    @Override
    public Page<CriticReview> getReviewsByMovieId(String movieId, PageRequest pageRequest) {
        return repository.findReviewByMovieId(movieId, pageRequest);
    }

    @Override
    public Page<CriticReview> findByMovieId(String movieId, PageRequest pageRequest) {
        return repository.findReviewByMovieId(movieId, pageRequest);
    }
}

