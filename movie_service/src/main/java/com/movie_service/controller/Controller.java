package com.movie_service.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.CompositeHealth;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class Controller {

    @Value("${spring.application.name}")
    private String appName;

    private final HealthEndpoint healthEndpoint;
    private final Environment environment;

    public Controller(HealthEndpoint healthEndpoint, Environment environment) {
        this.healthEndpoint = healthEndpoint;
        this.environment = environment;
    }

    /**
     * Service identity and health, reachable through the gateway at
     * /movie-service/. Status is the aggregate from Spring Boot Actuator, so a
     * service whose datastore is unreachable reports DOWN and answers 503.
     *
     * instanceId distinguishes multiple instances of the same service; it is
     * the same id this instance registers with Eureka under.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> root() {
        HealthComponent health = healthEndpoint.health();
        String status = health.getStatus().getCode();

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("name", appName);
        body.put("status", status);
        body.put("instanceId", environment.getProperty("eureka.instance.instance-id", "unknown"));
        body.put("host", environment.getProperty("spring.cloud.client.hostname", "unknown"));
        body.put("port", environment.getProperty("local.server.port", "unknown"));

        if (health instanceof CompositeHealth composite) {
            Map<String, String> components = new LinkedHashMap<>();
            composite.getComponents()
                     .forEach((name, component) -> components.put(name, component.getStatus().getCode()));
            body.put("components", components);
        }

        return ResponseEntity
                .status(Status.UP.getCode().equals(status) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                .body(body);
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return new ResponseEntity<>("OK", HttpStatus.OK);
    }

    @GetMapping("/app")
    public ResponseEntity<String> app() {
        return new ResponseEntity<>(appName, HttpStatus.OK);
    }

    @GetMapping("/proxy-image")
    public ResponseEntity<byte[]> proxyImage(@RequestParam String url) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            byte[] imageBytes = restTemplate.getForObject(url, byte[].class);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/proxy-image/{url}")
    public ResponseEntity<byte[]> proxyImageWithPathVariable(@PathVariable String url) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            byte[] imageBytes = restTemplate.getForObject(url, byte[].class);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}

