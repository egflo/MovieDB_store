package com.movie_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.movie_service.DTO.BookmarkDTO;
import com.movie_service.DTO.ItemDTO;
import com.movie_service.DTO.MovieDTO;
import com.movie_service.DTO.ReviewDTO;
import com.movie_service.grpc.ItemService;
import com.movie_service.models.Bookmark;
import com.movie_service.models.Movie;
import com.movie_service.models.Review;
import com.movie_service.models.Sentiment;
import com.movie_service.service.BookmarkService;
import com.movie_service.service.SentimentService;
import org.proto.grpc.ItemResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@ControllerAdvice(assignableTypes = ReviewController.class)
public class ReviewResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Autowired
    private SentimentService sentimentService;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType, Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {

        //Get header
        HttpHeaders header = request.getHeaders();

        System.out.println("Review Controller Advice");

        //Inject sentiment if user is logged in and has a sentiment for the review
        if (body instanceof Review) {
            Review review = (Review) body;
            ReviewDTO reviewDTO = new ReviewDTO(review);

            if (header.get("Authorization") != null) {
                String token = header.get("authorization").get(0).split(" ")[1].trim();
                DecodedJWT jwt = JWT.decode(token);
                String subject = jwt.getSubject();

                System.out.println("Sentiment Controller Advice: " + subject);
                Optional<Sentiment> sentiment = sentimentService.findByUserIdAndObjectId(
                        subject,
                        review.getId()
                );

                System.out.println("Sentiment Controller Advice: " + sentiment);

                if (sentiment.isPresent()) {
                    reviewDTO.setStatus(sentiment.get().getStatus());
                }

            }

            return reviewDTO;
        }

        if (body instanceof Page) {

            Page<Review> reviews = (Page<Review>) body;
            List<ReviewDTO> reviewDTOS = new ArrayList<>();

            for (Review review : reviews) {
                ReviewDTO reviewDTO = new ReviewDTO(review);

                if (header.get("Authorization") != null) {
                    String token = header.get("authorization").get(0).split(" ")[1].trim();
                    DecodedJWT jwt = JWT.decode(token);
                    String subject = jwt.getSubject();

                    System.out.println("Review Controller Advice: " + subject);
                    Optional<Sentiment> sentiment = sentimentService.findByUserIdAndObjectId(
                            subject,
                            review.getId()
                    );

                    if (sentiment.isPresent()) {
                        reviewDTO.setStatus(sentiment.get().getStatus());
                    }

                }

                reviewDTOS.add(reviewDTO);
            }

            Page<ReviewDTO> reviewDTOPage = new PageImpl<>(reviewDTOS, reviews.getPageable(), reviews.getTotalElements());

            return reviewDTOPage;


        }

        return body;
    }
}
