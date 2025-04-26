package com.user_service.models;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.bson.types.ObjectId;
import org.proto.grpc.Genre;
import org.proto.grpc.MovieResponse;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Setter
@Getter
@NoArgsConstructor
public class Movie {
    @Field("id")
    private String id;

    private String title;
    private Integer year;
    private String release_date;
    private String rated;
    private String runtime;
    private String director;
    private String poster;
    private String plot;
    private String logo;
    private String background;
    private List<String> genres;

    @Field("movie_id")
    private String movieId;

    public Movie(String id, String title, Integer year, String release_date, String rated, String runtime, String director, String poster, String plot, String background, String sku) {
        this.id = id;
        this.title = title;
        this.year = year;
        this.release_date = release_date;
        this.rated = rated;
        this.runtime = runtime;
        this.director = director;
        this.poster = poster;
        this.plot = plot;
        this.background = background;
        this.movieId = sku;
    }

    public Movie(MovieResponse movie) {
        this.id =  movie.getId();
        this.title = movie.getTitle();
        this.year = movie.getYear();
        this.release_date = movie.getReleaseDate();
        this.rated = movie.getRated();
        this.runtime = movie.getRuntime();
        this.director = movie.getDirector();
        this.poster = movie.getPoster();
        this.plot = movie.getPlot();
        this.background = movie.getBackground();
        this.movieId = movie.getSku();
        this.logo = movie.getLogo();

        //Convert genres from List<Genre> to List<String>
        this.genres = movie.getGenresList().stream().map(Genre::getName).toList();

    }

}
