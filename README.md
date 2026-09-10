# MovieDB_store

Mock webstore using microservices.

## Services

| Service | Port (HTTP / gRPC) | Data store | Routes |
|---|---|---|---|
| `eureka_server` | 8761 | — | service registry |
| `api_gateway` | 8760 | — | routing + Firebase auth |
| `movie_service` | 8080 / 9090 | Mongo `moviedb` | `/movie`, `/cast`, `/critic` |
| `inventory_service` | 8081 / 9091 | Postgres `inventorydb` | `/cart`, `/product` |
| `order_service` | 8082 / 9092 | Postgres `orderdb` | `/order`, `/payment-methods`, `/address` |
| `user_service` | 8083 / 9093 | Mongo `userdb` | `/user`, `/review`, `/comment`, `/bookmark`, `/sentiment` |

All services target **Java 25** and **Spring Boot 3.5.16**. gRPC service
definitions come from the external `com.github.egflo:interface_grpc` artifact
(via JitPack), not from this repo.

### Removed: tax_service

`tax_service` was removed in September 2026 — Stripe Tax handles tax calculation
in `order_service`'s checkout flow. It had already been disconnected for some
time: no gateway route, no gRPC client configured, and absent from
`docker-compose.yml`.

The code remains in git history, tagged `tax-service-last`:

```
git checkout tax-service-last -- tax_service
```

A commented-out gRPC client for it still sits in
`order_service/src/main/java/com/order_service/service/RateService.java`, along
with a dead call site in `OrderService.java`.

## Frontends

| App | Stack |
|---|---|
| `web_app` | Next 15, React 19, MUI v7, Firebase 11 |
| `web_store` | Next 15, React 18, MUI v5, Apollo Client, Stripe.js, Firebase 9 |

Neither frontend has a Dockerfile or a `docker-compose.yml` entry; both are run
manually.
