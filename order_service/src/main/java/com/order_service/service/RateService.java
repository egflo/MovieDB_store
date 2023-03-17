package com.order_service.service;


import net.devh.boot.grpc.client.inject.GrpcClient;
import org.proto.grpc.RateResponse;
import org.proto.grpc.RateResponseItems;
import org.proto.grpc.RateServiceGrpc;
import org.springframework.stereotype.Service;

@Service
public class RateService {

    @GrpcClient("tax-grpc-server")
    private RateServiceGrpc.RateServiceBlockingStub rateServiceBlockingStub;

    public RateServiceGrpc.RateServiceBlockingStub getRateServiceBlockingStub() {
        return rateServiceBlockingStub;
    }

    public void setRateServiceBlockingStub(RateServiceGrpc.RateServiceBlockingStub rateServiceBlockingStub) {
        this.rateServiceBlockingStub = rateServiceBlockingStub;
    }

    public RateResponse getRate(String postCode) {
        return rateServiceBlockingStub.getRate(org.proto.grpc.RateRequest.newBuilder().setPostCode(postCode).build());
    }

    public RateResponseItems getRateByCity(String city) {
        return rateServiceBlockingStub.getRateCity(org.proto.grpc.RateRequestCity.newBuilder().setCity(city).build());
    }


}
