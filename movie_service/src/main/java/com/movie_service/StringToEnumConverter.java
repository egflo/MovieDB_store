package com.movie_service;

import com.movie_service.models.Status;
import org.springframework.core.convert.converter.Converter;

public class StringToEnumConverter implements Converter<String, Status> {
    @Override
    public Status convert(String source) {
        try {
            return Status.valueOf(source.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + source);
        }
    }
}
