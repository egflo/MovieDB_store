package com.user_service.DTO;

import com.user_service.models.Bookmark;
import com.user_service.models.Movie;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.proto.grpc.MovieResponse;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Setter
public class BookmarkDTO {

        private String id;

        private String userId;

        private Movie movie;

        private Date created;

        public BookmarkDTO() {

        }

        public BookmarkDTO(Bookmark bookmark) {
            this.id = bookmark.getId();
            this.userId = bookmark.getUserId();
            this.movie = bookmark.getMovie();
            this.created = bookmark.getCreated();
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
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

        public void setMovie(MovieResponse movie) {

            this.movie = new Movie(movie);
        }

        public Date getCreated() {
            return created;
        }

        public void setCreated(Date created) {
            this.created = created;
        }


        public Bookmark toBookmark() {
            Bookmark bookmark = new Bookmark();
            bookmark.setId(id);
            bookmark.setUserId(this.userId);
            bookmark.setMovie(this.movie);
            bookmark.setCreated(this.created);
            return bookmark;
        }

    @Override
    public String toString() {

        return "BookmarkDTO{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", movie=" + movie +
                ", created=" + created +
                '}';
    }
}
