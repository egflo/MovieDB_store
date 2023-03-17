package com.tax_service.service;

import com.tax_service.DTO.RateDTO;
import com.tax_service.model.Rate;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface RateServiceImp {

    List<Rate> findRateByCityContainingIgnoreCase(String city);

    Rate save(RateDTO rateDTO);

    Optional<Rate> findByCity(String city);
    Optional<Rate> findByCounty(String county);
    Optional<Rate> findByState(String state);
    Optional<Rate> findByPostcode(String postcode);
    Optional<Rate> findByCountyCode(String countyCode);
    Optional<Rate> findByStateCode(String stateCode);
    Optional<Rate> findByLatitudeAndLongitude(Double latitude, Double longitude);
    Optional<Rate> findByMilitary(boolean military);

    Page<Rate> findAll(Pageable pageable);


}
