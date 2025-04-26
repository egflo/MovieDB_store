package com.inventory_service.DTO;


import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.proto.grpc.MovieResponse;

@NoArgsConstructor
@Getter
@Setter
public class ProductDTO {
    String id;
    String image;
    String name;
    String description;

    ProductDTO(String id, String image, String name, String description) {
        this.id = id;
        this.image = image;
        this.name = name;
        this.description = description;
    }
}
