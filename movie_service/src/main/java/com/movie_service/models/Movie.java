package com.movie_service.models;


import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Document(collection = "movies")
public class Movie {

    ObjectId id;

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

    @Field("logo")
    String logo;

    List<Cast> cast;

    Rating ratings;

    String movieId;

    Double popularity;

    Long revenue;


    @Field("keywords")
    List<Tag> tags;

    public Movie() {
    }

public Movie(String movieId, String title, Integer year, String rated, String runtime, List<String> genres,
             String director, String writer, String boxOffice, String production, String plot, String logo,
             String language, String country, String awards, String poster, String background,
             List<Cast> cast, Rating ratings, Double popularity, Long revenue) {
        this.title = title;
        this.year = year;
        this.rated = rated;
        this.runtime = runtime;
        this.genres = genres;
        this.director = director;
        this.writer = writer;
        this.boxOffice = boxOffice;
        this.production = production;
        this.plot = plot;
        this.language = language;
        this.country = country;
        this.awards = awards;
        this.poster = poster;
        this.background = background;
        this.cast = cast;
        this.ratings = ratings;
        this.movieId = movieId;
        this.popularity = popularity;
        this.revenue = revenue;
        this.logo = logo;
    }

    public String getId() {
        return id.toHexString();
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }


    public String getRated() {
        return rated;
    }

    public void setRated(String rated) {
        this.rated = rated;
    }


    public String getRuntime() {
        return runtime;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public String getDirector() {
        return director;
    }

    public void setDirector(String director) {
        this.director = director;
    }

    public String getWriter() {
        return writer;
    }

    public void setWriter(String writer) {
        this.writer = writer;
    }

    public String getBoxOffice() {
        return boxOffice;
    }

    public void setBoxOffice(String boxOffice) {
        this.boxOffice = boxOffice;
    }

    public String getProduction() {
        return production;
    }

    public void setProduction(String production) {
        this.production = production;
    }

    public String getPlot() {
        return plot;
    }

    public void setPlot(String plot) {
        this.plot = plot;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getAwards() {
        return awards;
    }

    public void setAwards(String awards) {
        this.awards = awards;
    }

    public String getPoster() {
        return poster;
    }

    public void setPoster(String poster) {
        this.poster = poster;
    }

    public String getBackground() {
        return background;
    }

    public void setBackground(String background) {
        this.background = background;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public List<Cast> getCast() {
        return cast;
    }

    public void setCast(List<Cast> cast) {
        this.cast = cast;
    }

    public Rating getRatings() {
        return ratings;
    }

    public void setRatings(Rating ratings) {
        this.ratings = ratings;
    }

    public String getMovieId() {
        return this.movieId;
    }

    public void setMovieId(String id) {
        this.movieId = id;
    }

    public Double getPopularity() {
        return popularity;
    }

    public void setPopularity(Double popularity) {
        this.popularity = popularity;
    }

    public Long getRevenue() {
        return revenue;
    }

    public void setRevenue(Long revenue) {
        this.revenue = revenue;
    }

    public List<Tag> getTags() {
        return tags;
    }

    public void setKeywords(List<Tag> setTags) {
        this.tags = tags;
    }

}
