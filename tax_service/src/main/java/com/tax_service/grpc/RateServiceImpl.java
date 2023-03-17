package com.tax_service.grpc;


import com.tax_service.model.Rate;
import com.tax_service.repository.RateRepository;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.proto.grpc.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@GrpcService
public class RateServiceImpl extends RateServiceGrpc.RateServiceImplBase {
    @Autowired
    RateRepository repository;

    @Override
    public void getRate(RateRequest request, StreamObserver<RateResponse> responseObserver) {

        Optional<Rate> rate = Optional.ofNullable(repository.findByPostcode(request.getPostCode()));

        RateResponse response = RateResponse.newBuilder()
                .setId(rate.get().getId())
                .setCity(rate.get().getCity())
                .setState(rate.get().getState())
                .setCounty(rate.get().getCounty())
                .setStateCode(rate.get().getStateCode())
                .setCountyCode(rate.get().getCountyCode())
                .setPostCode(rate.get().getPostcode())
                .setMilitary(rate.get().isMilitary())
                .setPostCode(rate.get().getPostcode())
                .setLatitude(rate.get().getLatitude().floatValue())
                .setLongitude(rate.get().getLongitude().floatValue())
                .setRate(rate.get().getRate().floatValue())
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getRateCity(RateRequestCity request, StreamObserver<RateResponseItems> responseObserver) {
        List<Rate> cities = repository.findRateByCityContainingIgnoreCase(request.getCity());

        RateResponseItems.Builder response = RateResponseItems.newBuilder();

        for (Rate city : cities) {
            RateResponse item = RateResponse.newBuilder()
                    .setId(city.getId())
                    .setCity(city.getCity())
                    .setState(city.getState())
                    .setCounty(city.getCounty())
                    .setStateCode(city.getStateCode())
                    .setCountyCode(city.getCountyCode())
                    .setPostCode(city.getPostcode())
                    .setMilitary(city.isMilitary())
                    .setPostCode(city.getPostcode())
                    .setLatitude(city.getLatitude().floatValue())
                    .setLongitude(city.getLongitude().floatValue())
                    .setRate(city.getRate().floatValue())
                    .build();
            response.addItems(item);
        }

        responseObserver.onNext(response.build());
        responseObserver.onCompleted();
    }

}
