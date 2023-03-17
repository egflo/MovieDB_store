package com.tax_service.DTO;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class RateDTO {

    String city;
    String countyCode;
    String county;
    String stateCode;
    String state;
    String postcode;
    boolean military;
    Double latitude;
    Double longitude;
    Double rate;
}
