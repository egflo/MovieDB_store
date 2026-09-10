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
| `tax_service` | — | — | **retired** — see [tax_service/README.md](tax_service/README.md) |

`tax_service` was retired in August 2026; Stripe Tax handles tax calculation in
`order_service` now. The code is kept for reference but is not deployed, routed,
or called.

gRPC service definitions come from the external `com.github.egflo:interface_grpc`
artifact (via JitPack), not from this repo.

## Frontends

| App | Stack |
|---|---|
| `web_app` | Next 15, React 19, MUI v7, Firebase 11 |
| `web_store` | Next 15, React 18, MUI v5, Apollo Client, Stripe.js, Firebase 9 |

Neither frontend has a Dockerfile or a `docker-compose.yml` entry; both are run
manually.
