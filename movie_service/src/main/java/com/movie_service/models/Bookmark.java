package com.movie_service.models;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;


//Entity class for the bookmark collection in the database
//This class is used to store the bookmarked movies of a user
@Document(collection = "bookmarks")
public class Bookmark {

        @Id
        private ObjectId id;


        private String userId;

        @DBRef
        private Movie movie;

        private String created;

        public Bookmark() {
        }

        public Bookmark(String userId,  Movie movie, String created) {
            this.userId = userId;
            this.movie = movie;
            this.created = created;
        }

        public String getId() {
            return id.toHexString();
        }

        public void setId(String id) {
            this.id = new ObjectId(id);
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

        public String getCreated() {
            return created;
        }

        public void setCreated(String created) {
            this.created = created;
        }

}
