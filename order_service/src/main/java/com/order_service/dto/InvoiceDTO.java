package com.order_service.dto;

import java.util.List;

public class InvoiceDTO {

    AddressDTO address;
    List<CartItemDTO> items;
    PaymentSheetDTO paymentSheet;
    Long total;
    Long subTotal;
    Long tax;
    Long shipping;

    public InvoiceDTO() {
    }

    public InvoiceDTO(AddressDTO address, List<CartItemDTO> items, PaymentSheetDTO paymentSheet, Long total, Long subTotal, Long tax, Long shipping) {
        this.address = address;
        this.items = items;
        this.paymentSheet = paymentSheet;
        this.total = total;
        this.subTotal = subTotal;
        this.tax = tax;
        this.shipping = shipping;
    }
    public AddressDTO getAddress() {
        return address;
    }

    public void setAddress(AddressDTO address) {
        this.address = address;
    }

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    public Long getTotal() {
        return total;
    }

    public void setTotal(Long total) {
        this.total = total;
    }

    public Long getSubTotal() {
        return subTotal;
    }

    public void setSubTotal(Long subTotal) {
        this.subTotal = subTotal;
    }


    public Long getTax() {
        return tax;
    }

    public void setTax(Long tax) {
        this.tax = tax;
    }

    public Long getShipping() {
        return shipping;
    }

    public void setShipping(Long shipping) {
        this.shipping = shipping;
    }

    public PaymentSheetDTO getPaymentSheet() {
        return paymentSheet;
    }

    public void setPaymentSheet(PaymentSheetDTO paymentSheet) {
        this.paymentSheet = paymentSheet;
    }

}
