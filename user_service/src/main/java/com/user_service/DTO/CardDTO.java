package com.order_service.dto;
import com.stripe.model.PaymentMethod.Card ;

import java.util.List;

public class CardDTO {
    private String brand;
    private String country;
    private Long exp_month;
    private Long exp_year;
    private String fingerprint;
    private String funding;
    private String last4;
    private List<String> network;


    public CardDTO() {
    }

    public CardDTO(String brand, String country, Long exp_month, Long exp_year, String fingerprint, String funding, String last4, List<String> network) {
        this.brand = brand;
        this.country = country;
        this.exp_month = exp_month;
        this.exp_year = exp_year;
        this.fingerprint = fingerprint;
        this.funding = funding;
        this.last4 = last4;
        this.network = network;

    }

    public CardDTO(Card card) {
        this.brand = card.getBrand();
        this.country = card.getCountry();
        this.exp_month = card.getExpMonth();
        this.exp_year = card.getExpYear();
        this.fingerprint = card.getFingerprint();
        this.funding = card.getFunding();
        this.last4 = card.getLast4();

        Card.Networks networks = card.getNetworks();

        if (networks != null) {
            this.network = networks.getAvailable();
        }
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Long getExp_month() {
        return exp_month;
    }

    public void setExp_month(Long exp_month) {
        this.exp_month = exp_month;
    }

    public Long getExp_year() {
        return exp_year;
    }


    public void setExp_year(Long exp_year) {
        this.exp_year = exp_year;
    }

public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }


    public String getFunding() {
        return funding;
    }

    public void setFunding(String funding) {
        this.funding = funding;
    }

    public String getLast4() {
        return last4;
    }

    public void setLast4(String last4) {
        this.last4 = last4;
    }

    public List<String> getNetwork() {
        return network;
    }

    public void setNetwork(List<String> network) {
        this.network = network;
    }


}
