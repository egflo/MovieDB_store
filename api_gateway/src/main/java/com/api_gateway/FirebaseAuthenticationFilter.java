package com.api_gateway;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;
import reactor.core.publisher.Mono;

@Component
public class FirebaseAuthenticationFilter implements GlobalFilter {

    /** Header the services read as "who is calling". Only this filter may set it. */
    private static final String UID = "uid";

    private static final PathPattern ADMIN_ROUTE = PathPatternParser.defaultInstance.parse("/*-service/admin/**");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // The services trust this header as the caller's identity, so a value
        // sent by the client must never reach them: drop it on every request,
        // then set it below only from a verified token.
        ServerHttpRequest stripped = exchange.getRequest().mutate()
                .headers(headers -> headers.remove(UID))
                .build();
        exchange = exchange.mutate().request(stripped).build();

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Public routes only: SecurityConfig rejects anything else without a token.
            return chain.filter(exchange);
        }

        String token = authHeader.substring(7);
        try {
            // On admin routes also ask Firebase whether the user's sessions were
            // revoked, so taking ADMIN away (GrantRole --revoke) applies at
            // once instead of when the token expires. One extra call, so only there.
            boolean adminRoute = ADMIN_ROUTE.matches(exchange.getRequest().getPath().pathWithinApplication());
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(token, adminRoute);
            String uid = decodedToken.getUid();

            // Add UID to request attributes
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header(UID, uid)
                    .build();

            ServerWebExchange mutatedExchange = exchange.mutate().request(mutatedRequest).build();
            mutatedExchange.getAttributes().put(UID, uid);
            System.out.println("UID added to attributes: " + mutatedExchange.getAttributes().get(UID));

            // Forward the request downstream
            return chain.filter(mutatedExchange);

        } catch (FirebaseAuthException e) {
            // Handle invalid token case
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }
}
