package com.tax_service.service;

import com.tax_service.DTO.RateDTO;
import com.tax_service.DTO.TaxDTO;
import com.tax_service.model.Rate;
import com.tax_service.repository.RateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class RateService implements RateServiceImp {
    @Autowired
    private RateRepository rateRepository;

    @Override
    public List<Rate> findRateByCityContainingIgnoreCase(String city) {
        return rateRepository.findRateByCityContainingIgnoreCase(city);
    }

    @Override
    public Rate save(RateDTO rateDTO) {
        Rate rate = new Rate();
        rate.setCity(rateDTO.getCity());
        rate.setCounty(rateDTO.getCounty());
        rate.setState(rateDTO.getState());
        rate.setPostcode(rateDTO.getPostcode());
        rate.setCountyCode(rateDTO.getCountyCode());
        rate.setStateCode(rateDTO.getStateCode());
        rate.setLatitude(rateDTO.getLatitude());
        rate.setLongitude(rateDTO.getLongitude());
        rate.setMilitary(rateDTO.isMilitary());
        rate.setRate(rateDTO.getRate());
        return rateRepository.save(rate);
    }

    @Override
    public Optional<Rate> findByCity(String city) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByCity(city));
        return rate;
    }

    @Override
    public Optional<Rate> findByCounty(String county) {

        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByCounty(county));
        return rate;
    }

    @Override
    public Optional<Rate> findByState(String state) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByState(state));
        return rate;
    }

    @Override
    public Optional<Rate> findByPostcode(String postcode) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByPostcode(postcode));
        return rate;
    }

    @Override
    public Optional<Rate> findByCountyCode(String countyCode) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByCountyCode(countyCode));
        return rate;
    }

    @Override
    public Optional<Rate> findByStateCode(String stateCode) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByStateCode(stateCode));
        return rate;
    }

    @Override
    public Optional<Rate> findByLatitudeAndLongitude(Double latitude, Double longitude) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByLatitudeAndLongitude(latitude, longitude));
        return rate;
    }

    @Override
    public Optional<Rate> findByMilitary(boolean military) {
        Optional<Rate> rate = Optional.ofNullable(rateRepository.findByMilitary(military));
        return rate;
    }

    @Override
    public Page<Rate> findAll(Pageable pageable) {
        return rateRepository.findAll(pageable);
    }

    public Rate updateTax(TaxDTO request) {
        Rate rate = rateRepository.findById(request.getId()).get();
        rate.setRate(request.getTax());

        return rateRepository.save(rate);
    }
}
