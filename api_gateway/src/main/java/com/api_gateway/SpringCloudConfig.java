package com.api_gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

//@Configuration
public class SpringCloudConfig {

   // @Autowired
   // private TokenRelayGatewayFilterFactory filterFactory;

    /**
    // * This method is used to route the request to the appropriate microservice
    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(r -> r.path("/movie-service/**")
                        .filters(f -> f.rewritePath("/movie-service/(?<segment>.*)", "/${segment}"))
                        .uri("lb://movie-service"))
                .route(r -> r.path("/order-service/**")
                        .filters(f -> f.rewritePath("/order-service/(?<segment>.*)", "/${segment}"))
                        .uri("lb://order-service"))
                .route(r -> r.path("/inventory-service/**")
                        .filters(f -> f.rewritePath("/inventory-service/(?<segment>.*)", "/${segment}"))
                        .uri("lb://inventory-service"))
                .build();
    }
    **/

}