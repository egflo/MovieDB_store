package com.tax_service.model;


import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;



@NoArgsConstructor
@Setter
@Getter
@Entity(name = "Rate") // This tells Hibernate to make a table out of this class
public class Rate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String city;

    @Column(name = "county_code")
    private  String countyCode;

    private String county;

    @Column(name = "state_code")
    private String stateCode;

    private String state;

    private String postcode;

    boolean military;

    Double latitude;

    Double longitude;

    Double rate;
}
