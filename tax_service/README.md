# tax_service — RETIRED

**Status:** Retired August 2026. Superseded by Stripe Tax, which now handles tax
calculation inside the checkout flow in `order_service`.

The code is kept here for reference. It is not deployed, not routed, and not
called by anything.

## What it did

Looked up US sales-tax rates from a flat `Rate` table in Postgres (`TaxDB`),
keyed by postcode, city, county, or state. It exposed two interfaces:

- **REST** — `/rate` (see `controller/RateController.java`): add a rate, update a
  rate, and look up by postcode / city / state, plus a paginated `/rate/all`.
- **gRPC** — `RateService` with `GetRate` (by postcode) and `GetRateCity`
  (by city, returns a list). Definitions live in the external
  `com.github.egflo:interface_grpc` artifact, not in this repo.

## How it was disconnected

All of these are already in place — no further work is needed to keep it inert:

| Layer | State |
|---|---|
| `order_service/service/RateService.java` | entire class body commented out |
| `order_service/service/OrderService.java:122` | call site commented out |
| `order_service` `application.yml` | no `tax-grpc-server` gRPC client configured |
| `api_gateway` `application.yml` | no `/tax/**` route |
| root `docker-compose.yml` | service not present |
| build | no aggregator pom; services build standalone |

## If you ever revive it

Things to fix first — these are known defects in the code as it stands:

- `grpc/RateServiceImpl.java` calls `rate.get()` on an `Optional` without
  checking presence. An unknown postcode throws `NoSuchElementException` and the
  caller sees an opaque gRPC `UNKNOWN`.
- Same file: `.setPostCode()` is set twice on both builders (copy-paste), and
  `getLatitude().floatValue()` / `getRate().floatValue()` will NPE on null columns.
- `repository/RateRepository.java` — `findByCity` and `findByState` return a
  single `Rate`, but neither column is unique. Multiple matches throw
  `IncorrectResultSizeDataAccessException` at runtime.
- The pom pins Spring Boot 3.0.4 / Java 17; every other service is on 3.4.2 /
  Java 18.
- Default ports (HTTP `8083`, gRPC `9093`) collide with `user_service`. Pick new
  ones before running both.

Reviving also means re-adding the gRPC client config in `order_service`, a
gateway route, and a compose entry — and deciding how it coexists with Stripe Tax.

## Note on the database

Retiring the service does not drop the `TaxDB` Postgres database. If you have one
locally, it is still there.
