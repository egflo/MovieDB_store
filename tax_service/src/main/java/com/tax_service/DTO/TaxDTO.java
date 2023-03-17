package com.tax_service.DTO;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class TaxDTO {

    @NonNull
    Long id;

    @NonNull
    Double tax;
}
