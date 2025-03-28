package com.user_service.models;

import com.user_service.DTO.BookmarkRequest;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;


//Entity class for the bookmark collection in the database
//This class is used to store the bookmarked movies of a user
@Document(collection = "bookmarks")
public class Bookmark {

        @Id
        private ObjectId id;

        private String userId;

        private Movie movie;

        private Date created;

        public Bookmark() {

        }

        public Bookmark(BookmarkRequest request) {
            this.userId = request.getUserId();
            this.created = new Date();
        }

        public Bookmark(String userId,  Movie movie, Date created) {
            this.userId = userId;
            this.movie = movie;
            this.created = created;
        }

        public ObjectId getId() {
            return id;
        }

        public void setId(ObjectId id) {
            this.id = id;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
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
