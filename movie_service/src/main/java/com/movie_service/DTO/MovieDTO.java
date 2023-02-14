package com.movie_service.DTO;

import com.movie_service.models.*;

import java.util.List;

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

    List<Cast> cast;

    Rating ratings;

    String movieId;

    Long revenue;

    List<Tag> keywords;

    ItemDTO itemDTO;

    public MovieDTO(Movie movie) {
        this.id = movie.getId();
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
        this.revenue = movie.getRevenue();
        this.keywords = movie.getTags();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
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
        return movieId;
    }

    public void setMovieId(String movieId) {
        this.movieId = movieId;
    }


    public Long getRevenue() {
        return revenue;
    }

    public void setRevenue(Long revenue) {
        this.revenue = revenue;
    }

    public List<Tag> getTags() {
        return keywords;
    }

    public void setTags(List<Tag> keywords) {
        this.keywords = keywords;
    }

    public ItemDTO getInventory() {
        return itemDTO;
    }

    public void setInventory(ItemDTO itemDTO) {
        this.itemDTO = itemDTO;
    }

}
