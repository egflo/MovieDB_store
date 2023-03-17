package com.tax_service.repository;

import com.tax_service.model.Rate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RateRepository extends JpaRepository<Rate, Long> {

    List<Rate> findRateByCityContainingIgnoreCase(String city);

    Rate findByCity(String city);
    Rate findByCounty(String county);
    Rate findByState(String state);
    Rate findByPostcode(String postcode);
    Rate findByCountyCode(String countyCode);
    Rate findByStateCode(String stateCode);
    Rate findByLatitudeAndLongitude(Double latitude, Double longitude);
    Rate findByMilitary(boolean military);
}
