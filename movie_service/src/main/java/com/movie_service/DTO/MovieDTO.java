package com.movie_service.DTO;

import com.movie_service.models.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

//lombok
@Getter
@Setter
@NoArgsConstructor
public class MovieDTO {
    String id;
    String title;
    Integer year;
    String rated;
    String runtime;
    List<String> genres;
    String director;
    String writer;
    String boxOffice;
    String production;
    String plot;
    String language;
    String country;
    String awards;
    String poster;
    String background;
    String logo;
    List<Cast> cast;
    Rating ratings;
    String movieId;
    Double popularity;
    Long revenue;
    List<Tag> tags;

    ItemDTO item;

    BookmarkDTO bookmark;

    SentimentDTO sentiment;

    public MovieDTO(Movie movie) {
        this.id = movie.getId().toString();
        this.title = movie.getTitle();
        this.year = movie.getYear();
        this.rated = movie.getRated();
        this.runtime = movie.getRuntime();
        this.genres = movie.getGenres();
        this.director = movie.getDirector();
        this.writer = movie.getWriter();
        this.boxOffice = movie.getBoxOffice();
        this.production = movie.getProduction();
        this.plot = movie.getPlot();
        this.language = movie.getLanguage();
        this.country = movie.getCountry();
        this.awards = movie.getAwards();
        this.poster = movie.getPoster();
        this.background = movie.getBackground();
        this.cast = movie.getCast();
        this.ratings = movie.getRatings();
        this.movieId = movie.getMovieId();
        this.popularity = movie.getPopularity();
        this.revenue = movie.getRevenue();
        this.tags = movie.getTags();
        this.logo = movie.getLogo();
    }

}
