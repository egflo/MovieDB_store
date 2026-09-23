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

## Running locally

Requires Mongo on 27017 and Postgres on 5432 with databases `moviedb`, `userdb`,
`inventorydb` and `orderdb`. The defaults in each `application.yml` already point
there with `postgres`/`postgres` credentials, so no database configuration is
needed.

Credentials (the Stripe keys and the Firebase service account) live in an
untracked `secrets/` directory at the repo root; see
[secrets/README.md](secrets/README.md) to set it up. Without it the gateway and
`user_service` fail at startup, and checkout fails.

**In IntelliJ** — run the **`MovieDB Services`** compound configuration. It starts
all six at once; Eureka gets no head start, so expect a few registration retries
in the logs before things settle.

**From a terminal**:

```
./scripts/dev.sh
```

It checks both databases are listening, starts Eureka, waits for it, then starts
the rest. Ctrl+C stops everything. Logs land in `logs/<service>.log`.

| | |
|---|---|
| Eureka dashboard | http://localhost:8761 |
| API gateway | http://localhost:8760 |
| movie / inventory / order / user | 8080 / 8081 / 8082 / 8083 |
| gRPC | 9090 / 9091 / 9092 / 9093 |

The HTTP and gRPC ports above are pinned by the run configurations purely so the
URLs are predictable. Left alone, `movie_service`, `inventory_service` and
`order_service` bind `SERVER_PORT:0` — a random port — which works fine, since
the gateway reaches them through Eureka. `user_service` has no `server:` block
and so takes Spring's default 8080.

The frontend runs separately: `cd web_app && npm run dev`.

## Frontend

**`web_app`** — Next.js 15 (App Router), React 19, MUI v7, Tailwind v4,
Firebase 11 via `next-firebase-auth-edge`, Stripe. Run manually; it has no
Dockerfile or `docker-compose.yml` entry.

| Area | Routes |
|---|---|
| Catalog | `/`, `/movie/[id]`, `/movie/[id]/reviews`, `/cast/[id]`, `/search` |
| Auth | `/login`, `/register` |
| Commerce | `/cart`, `/checkout` |
| Account | `/user/info`, `/user/orders`, `/user/order/[id]`, `/user/favorites`, `/user/address/{info,add,[id]}`, `/user/payments` |

Auth runs in edge middleware: the session cookie is read server-side in
`app/layout.tsx` and handed to client components through `useAuth()`. The API
gateway decodes the Firebase token and injects a `uid` header downstream, so
callers only send `Authorization: Bearer <idToken>`.

Set `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `web_app/.env` before using
checkout — it ships empty, and the page will tell you so rather than failing
obscurely.

### Removed: web_store

`web_store` was the original storefront (Pages Router, React 18, MUI v5, Apollo,
formik). It was removed in September 2026 once `web_app` covered all 15 of its
routes. The code remains in git history, tagged `web-store-last`:

```
git checkout web-store-last -- web_store
```

[docs/web_store-inventory.md](docs/web_store-inventory.md) records what was in
it. Three API bugs were found and fixed during the port rather than carried
over — see that file.

## Known rough edges

- `docker-compose.yml` defines no Mongo or Postgres containers, and the services
  point at `localhost` from inside their own containers, so the stack does not
  come up as written. It also still carries a broken YAML anchor
  (`&image_prefix` used where `*image_prefix` was meant).
- The explicit `routes:` block in the gateway config is dead — it has no
  `StripPrefix` filter. Routing actually works through
  `discovery.locator.enabled`, which serves `/{service-id}/**`.
- `order_service` has no Stripe webhook handler, so no order ever advances past
  `CREATED`. The `Status` enum's `PAID`/`SHIPPED`/`DELIVERED` values are unused.
- `AddressController` and `PaymentController` in `order_service`, and
  `AddressController` in `user_service`, repeat `@RequestMapping` on both class
  and method, so their real paths are doubled (e.g. `/address/address`).
