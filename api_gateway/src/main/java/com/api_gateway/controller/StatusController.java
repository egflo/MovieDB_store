package com.api_gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.CompositeHealth;
import org.springframework.boot.actuate.health.HealthComponent;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.health.Status;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.ReactiveDiscoveryClient;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Gateway identity, health, the routes it is serving, and every service
 * currently registered with Eureka along with how many instances of each are up.
 *
 * Reactive because the gateway runs on WebFlux; blocking here would stall the
 * event loop.
 */
@RestController
public class StatusController {

    @Value("${spring.application.name}")
    private String appName;

    private final HealthEndpoint healthEndpoint;
    private final Environment environment;
    private final ReactiveDiscoveryClient discoveryClient;
    private final RouteLocator routeLocator;

    public StatusController(HealthEndpoint healthEndpoint,
                            Environment environment,
                            ReactiveDiscoveryClient discoveryClient,
                            RouteLocator routeLocator) {
        this.healthEndpoint = healthEndpoint;
        this.environment = environment;
        this.discoveryClient = discoveryClient;
        this.routeLocator = routeLocator;
    }

    @GetMapping("/")
    public Mono<ResponseEntity<Map<String, Object>>> root() {
        // HealthEndpoint is the blocking API: its indicators call block()
        // internally, which throws if invoked on a WebFlux event-loop thread.
        // Run it on the elastic scheduler instead.
        Mono<HealthComponent> healthMono = Mono
                .fromCallable(healthEndpoint::health)
                .subscribeOn(Schedulers.boundedElastic());

        return Mono.zip(healthMono, routes(), services()).map(all -> {
            HealthComponent health = all.getT1();
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
                         .forEach((name, c) -> components.put(name, c.getStatus().getCode()));
                body.put("components", components);
            }

            body.put("routes", all.getT2());
            body.put("services", all.getT3());

            return ResponseEntity
                    .status(Status.UP.getCode().equals(status) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
                    .body(body);
        });
    }

    /** Routes the gateway is actually serving, including those the discovery
     *  locator generates from Eureka registrations. */
    private Mono<List<Map<String, String>>> routes() {
        return routeLocator.getRoutes()
                .map(this::describe)
                .collectSortedList(Comparator.comparing(r -> r.get("id")));
    }

    private Map<String, String> describe(Route route) {
        Map<String, String> r = new LinkedHashMap<>();
        r.put("id", route.getId());
        r.put("uri", String.valueOf(route.getUri()));
        r.put("predicate", String.valueOf(route.getPredicate()));
        return r;
    }

    /** Every registered service and how many instances of it are up. */
    private Mono<List<Map<String, Object>>> services() {
        return discoveryClient.getServices()
                .flatMap(this::describeService)
                .collectSortedList(Comparator.comparing(s -> String.valueOf(s.get("name"))));
    }

    private Mono<Map<String, Object>> describeService(String serviceId) {
        return discoveryClient.getInstances(serviceId)
                .collectList()
                .map(instances -> {
                    Map<String, Object> s = new LinkedHashMap<>();
                    s.put("name", serviceId);
                    s.put("instances", instances.size());
                    s.put("detail", instances.stream().map(this::describeInstance).toList());
                    return s;
                });
    }

    private Map<String, Object> describeInstance(ServiceInstance instance) {
        Map<String, Object> i = new LinkedHashMap<>();
        i.put("instanceId", instance.getInstanceId());
        i.put("host", instance.getHost());
        i.put("port", instance.getPort());
        i.put("uri", String.valueOf(instance.getUri()));
        return i;
    }
}
