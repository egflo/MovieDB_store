package com.movie_service;


import com.movie_service.models.Status;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.convert.converter.Converter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    //@Override
    //public void addCorsMappings(CorsRegistry registry) {
       // registry.addMapping("/**")
        //        .allowedOrigins("http://localhost:3000")
      //          .allowedMethods("GET", "POST", "PUT", "DELETE", "HEAD")
     //           .allowCredentials(true);
    //}
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToEnumConverter());
    }
}
