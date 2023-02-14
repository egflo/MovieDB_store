package com.movie_service.models;


import org.springframework.data.mongodb.core.mapping.Field;

public class User {

    @Field("id")
    Integer id;

    @Field("firstname")
    String firstname;


    @Field("lastname")
    String lastname;

    String email;


    public User() {
    }

    public User(Integer id, String first_name, String last_name, String email) {
        this.id = id;
        this.firstname = first_name;
        this.lastname = last_name;
        this.email = email;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String first_name) {
        this.firstname = first_name;
    }

    public String getLastname() {
        return lastname;
    }

    public void setLastname(String last_name) {
        this.lastname = last_name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

}
