package com.user_service.models;

import com.user_service.DTO.BookmarkRequest;
import org.bson.types.ObjectId;
import org.proto.grpc.MovieResponse;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;


//@Document(collection = "bookmarks")
public class Bookmark {

        private String id;

        private String userId;

        private String movieId;

        private Movie movie;

        private Date created;

        public Bookmark() {

        }

        public Bookmark(BookmarkRequest request) {
            this.userId = request.getUserId();
            this.movieId = request.getMovieId();
            this.created = new Date();
        }

        public Bookmark(String userId, MovieResponse movie) {
            this.userId = userId;
            this.movieId = movie.getId();
            this.movie = new Movie(movie);
            this.created = new Date();
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {this.id = id;}

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getMovieId() {
            return movieId;
        }

        public void setMovieId(String movieId) {
            this.movieId = movieId;
        }

        public Movie getMovie() {
            return movie;
        }

        public void setMovie(Movie movie) {
            this.movie = movie;
        }

        public Date getCreated() {
            return created;
        }

        public void setCreated(Date created) {
            this.created = created;
        }

}
