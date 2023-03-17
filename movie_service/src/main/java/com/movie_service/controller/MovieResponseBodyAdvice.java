package com.movie_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.movie_service.DTO.BookmarkDTO;
import com.movie_service.DTO.ItemDTO;
import com.movie_service.DTO.MovieDTO;
import com.movie_service.grpc.ItemService;
import com.movie_service.models.Bookmark;
import com.movie_service.models.Movie;
import com.movie_service.service.BookmarkService;
import org.proto.grpc.ItemResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@ControllerAdvice(assignableTypes = MovieController.class)
public class MovieResponseBodyAdvice  implements ResponseBodyAdvice<Object> {

    @Autowired
    private ItemService inventoryService;

    @Autowired
    private BookmarkService bookmarkService;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType, Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {

        //Get header
        HttpHeaders header = request.getHeaders();

        //if Movie inject inventory
        if (body instanceof Movie) {
            Movie movie = (Movie) body;
            ItemResponse item = inventoryService.getItem(movie.getId());
            ItemDTO itemDTO = new ItemDTO(item);
            MovieDTO movieDTO = new MovieDTO(movie);
            movieDTO.setItem(itemDTO);

            if (header.get("Authorization") != null) {
                String token = header.get("authorization").get(0).split(" ")[1].trim();
                DecodedJWT jwt = JWT.decode(token);
                String subject = jwt.getSubject();

                Optional<Bookmark> bookmark = bookmarkService.getBookmarkByMovieIdAndUserId(
                        movie.getId(),
                        subject
                );

                SimpleBeanPropertyFilter simpleBeanPropertyFilter
                        = SimpleBeanPropertyFilter.serializeAllExcept("movie");
                FilterProvider filterProvider = new SimpleFilterProvider()
                        .addFilter("bookmarkFilter", simpleBeanPropertyFilter);
                MappingJacksonValue mappingJacksonValue = new MappingJacksonValue(bookmark);
                mappingJacksonValue.setFilters(filterProvider);

                if(bookmark.isPresent()){
                    movieDTO.setBookmark(new BookmarkDTO(bookmark.get()));
                }
            }

            return movieDTO;
        }

        //if Page<Movie> inject inventory
        if (body instanceof Page) {

            //If Page<Movie> inject inventory
            Page<Movie> movies = (Page<Movie>) body;

            //Pass page properties to DTO
            List<MovieDTO> content = new ArrayList<>();

            for (Movie movie : movies) {
                ItemResponse item = inventoryService.getItem(movie.getId());
                ItemDTO itemDTO = new ItemDTO(item);

                MovieDTO movieDTO = new MovieDTO(movie);
                movieDTO.setItem(itemDTO);

                if (header.get("Authorization") != null) {
                    String token = header.get("authorization").get(0).split(" ")[1].trim();
                    DecodedJWT jwt = JWT.decode(token);
                    String subject = jwt.getSubject();

                    Optional<Bookmark> bookmark = bookmarkService.getBookmarkByMovieIdAndUserId(
                            movie.getId(),
                            subject
                    );

                    if(bookmark.isPresent()){
                        BookmarkDTO bookmarkDTO = new BookmarkDTO(bookmark.get());
                        movieDTO.setBookmark(bookmarkDTO);
                    }
                }

                content.add(movieDTO);
            }

            return new PageImpl<>(content, movies.getPageable(), movies.getTotalElements());
        }

        return body;
    }
}
