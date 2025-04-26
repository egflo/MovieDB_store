package com.inventory_service.controller;

import com.inventory_service.model.Cart;
import com.inventory_service.repository.ItemRepository;
import com.inventory_service.grpc.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.List;


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

        //if Movie inject inventory
        if (body instanceof Cart) {


        }

        //if Page<Movie> inject inventory
        if (body instanceof Page) {


        }

        if (body instanceof List) {

        }

        return body;
    }
}
