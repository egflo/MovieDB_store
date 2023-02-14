package com.movie_service.models;

public class Rating
{

    Double rating;

    Double numOfVotes;

    Double metacritic;

    Double imdb;

    Double rottenTomatoes;

    Double rottenTomatoesAudience;

    String rottenTomatoesAudienceStatus;

    String rottenTomatoesStatus;


    public Rating() {
    }

    public Rating(Double rating, Double numOfVotes, Double metacritic, Double imdb, Double rottenTomatoes, Double rottenTomatoesAudience, String rottenTomatoesAudienceStatus, String rottenTomatoesStatus) {
        this.rating = rating;
        this.numOfVotes = numOfVotes;
        this.metacritic = metacritic;
        this.imdb = imdb;
        this.rottenTomatoes = rottenTomatoes;
        this.rottenTomatoesAudience = rottenTomatoesAudience;
        this.rottenTomatoesAudienceStatus = rottenTomatoesAudienceStatus;
        this.rottenTomatoesStatus = rottenTomatoesStatus;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Double getNumOfVotes() {
        return numOfVotes;
    }

    public void setNumOfVotes(Double numOfVotes) {
        this.numOfVotes = numOfVotes;
    }

    public Double getMetacritic() {
        return metacritic;
    }

    public void setMetacritic(Double metacritic) {
        this.metacritic = metacritic;
    }

    public Double getImdb() {
        return imdb;
    }

    public void setImdb(Double imdb) {
        this.imdb = imdb;
    }

    public Double getRottenTomatoes() {
        return rottenTomatoes;
    }

    public void setRottenTomatoes(Double rottenTomatoes) {
        this.rottenTomatoes = rottenTomatoes;
    }


    public Double getRottenTomatoesAudience() {
        return rottenTomatoesAudience;
    }


    public void setRottenTomatoesAudience(Double rottenTomatoesAudience) {
        this.rottenTomatoesAudience = rottenTomatoesAudience;
    }


    public String getRottenTomatoesAudienceStatus() {
        return rottenTomatoesAudienceStatus;
    }

    public String getRottenTomatoesStatus() {
        return rottenTomatoesStatus;
    }

    public void setRottenTomatoesStatus(String rottenTomatoesStatus) {
        this.rottenTomatoesStatus = rottenTomatoesStatus;
    }
}
