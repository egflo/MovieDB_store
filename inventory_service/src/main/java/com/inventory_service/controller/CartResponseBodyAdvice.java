package com.inventory_service.controller;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ser.FilterProvider;
import com.fasterxml.jackson.databind.ser.impl.SimpleBeanPropertyFilter;
import com.fasterxml.jackson.databind.ser.impl.SimpleFilterProvider;
import com.inventory_service.DTO.CartResponse;
import com.inventory_service.DTO.MovieDTO;
import com.inventory_service.DTO.ProductDTO;
import com.inventory_service.model.Cart;
import com.inventory_service.model.Item;
import com.inventory_service.repository.CartRepository;
import com.inventory_service.repository.ItemRepository;
import com.inventory_service.service.ItemService;
import com.inventory_service.service_grpc.MovieService;
import org.proto.grpc.MovieResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJacksonValue;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


@ControllerAdvice(assignableTypes = CartController.class)
public class CartResponseBodyAdvice implements ResponseBodyAdvice<Object> {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    MovieService movieService;

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType, Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        System.out.println("CartResponseBodyAdvice: " + body.toString());

        //if Movie inject inventory
        if (body instanceof Cart) {

            Cart cart = (Cart) body;
            Item item = itemRepository.findById(cart.getItemId()).get();
            MovieResponse movie = movieService.getMovie(cart.getItemId());
            MovieDTO movieDTO = new MovieDTO(movie);

            //Pass page properties to DTO
            CartResponse res = new CartResponse(cart);
            res.setPrice(item.getPrice());
            res.setMovie(movieDTO);

            return res;

        }

        //if Page<Movie> inject inventory
        if (body instanceof Page) {

            System.out.println("Page<Cart> detected");

            //If Page<Movie> inject inventory
            Page<Cart> carts = (Page<Cart>) body;

            //Pass page properties to DTO
            List<CartResponse> content = new ArrayList<>();

            for (Cart cart: carts) {
                Item item = itemRepository.findById(cart.getItemId()).get();
                MovieResponse movie = movieService.getMovie(cart.getItemId());
                MovieDTO movieDTO = new MovieDTO(movie);

                //Pass page properties to DTO
                CartResponse res = new CartResponse(cart);
                res.setPrice(item.getPrice());
                res.setMovie(movieDTO);
                content.add(res);
            }

            return new PageImpl<>(content, carts.getPageable(), carts.getTotalElements());
        }

        if (body instanceof List) {
            System.out.println("List<Cart> detected");

            //If Page<Movie> inject inventory
            List<Cart> carts = (List<Cart>) body;

            //Pass page properties to DTO
            List<CartResponse> content = new ArrayList<>();

            for (Cart cart: carts) {
                Item item = itemRepository.findById(cart.getItemId()).get();
                MovieResponse movie = movieService.getMovie(cart.getItemId());
                MovieDTO movieDTO = new MovieDTO(movie);

                //Pass page properties to DTO
                CartResponse res = new CartResponse(cart);
                res.setPrice(item.getPrice());
                res.setMovie(movieDTO);
                content.add(res);
            }

            return content;
        }

        return body;
    }
}
