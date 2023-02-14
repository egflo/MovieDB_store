package com.inventory_service.DTO;

public class MovieDTO {
    String id;
    String title;

    String poster;

    Integer year;


    public MovieDTO() {
    }

    public MovieDTO(String id, String title, String poster, Integer year) {
        this.id = id;
        this.title = title;
        this.poster = poster;
        this.year = year;
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

    public String getPoster() {
        return poster;
    }

    public void setPoster(String poster) {
        this.poster = poster;
    }


    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }


}
