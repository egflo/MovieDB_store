# Postman collection

`MovieDB_store.postman_collection.json` — 35 requests, 122 assertions, covering
every service through the API gateway.

## Running it

**Postman:** Import → select the JSON. Set the `idToken` collection variable,
then Run collection.

**Command line:**

```
npx newman run postman/MovieDB_store.postman_collection.json
```

Override the defaults with `--env-var`:

```
npx newman run postman/MovieDB_store.postman_collection.json \
  --env-var gatewayUrl=http://localhost:8760 \
  --env-var idToken=<a current Firebase ID token>
```

## Variables

| Variable | Default | |
|---|---|---|
| `gatewayUrl` | `http://localhost:8760` | |
| `eurekaUrl` | `http://localhost:8761` | |
| `idToken` | *(empty)* | a current Firebase ID token |
| `movieId`, `castId`, `itemId`, `orderId`, `addressId`, `bookmarkId` | *(empty)* | captured during the run |

Folder 2 captures `movieId`, `castId` and `itemId` from list endpoints and later
requests reuse them, so run the folders in order.

## About `idToken`

The gateway validates the bearer token and injects a `uid` header downstream.
Everything user-scoped — cart, orders, bookmarks, addresses, payment methods —
depends on that header.

The collection passes without a token: those requests are marked *skipped* and
only assert that the endpoint responded. Set `idToken` and they assert real
behaviour. Grab a token from the browser after signing in to `web_app`:

```js
await firebase.auth().currentUser.getIdToken()
```

Tokens expire after an hour.

## Folders

| | |
|---|---|
| **1. Health & Identity** | Every service's `/` identity endpoint, the gateway's route table and instance counts, the Eureka registry. Run this first — if it fails nothing else is meaningful. |
| **2. Movie Catalog** | Read-only catalog. Captures ids for later folders. |
| **3. Inventory & Cart** | Products (public) and cart (needs a token). |
| **4. Orders & Payments** | Orders, invoices, payment methods. All need a token. |
| **5. User, Reviews & Bookmarks** | Profile, addresses, bookmarks, reviews, comments, sentiment. |
| **6. Negative & Contract** | Unknown ids, unknown routes, and the unauthenticated-GET behaviour. |

## Things the tests found

These are asserted or documented in the collection rather than hidden:

- **`GET /movie/recommend/{id}` returns 500** for a valid Mongo id, while
  `/movie/suggest/{id}` returns 200 for the same id. The test accepts either and
  warns; tighten it to expect 200 once fixed.
- **A missing `uid` header produces 500**, not 401 or 400, with a raw Spring
  message: `Required request header 'uid' ... is not present`. That is what an
  unauthenticated call to a user-scoped endpoint looks like today.
- **`GET /bookmark/` reports "Request method 'GET' is not supported".**
  `BookmarkController` declares `@GetMapping("/all")` twice and its
  `@GetMapping("/")` does not register. The collection uses `/bookmark/all`.
- **Unauthenticated GETs are permitted** by the gateway
  (`pathMatchers(HttpMethod.GET, "/**").permitAll()`), so the "Cart without a
  token" test documents current behaviour rather than asserting 401. Tighten
  `SecurityConfig` and update that test.

## Paths

Requests use `/{service-id}/...`, which the gateway's discovery locator serves.
The hand-written `/movies/**` style routes in the gateway config have no
`StripPrefix` filter, so they arrive at the service with the prefix still
attached and match no mapping there.
