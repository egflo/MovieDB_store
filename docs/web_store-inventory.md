# web_store — content inventory

A reference snapshot of the `web_store` frontend, written so its contents stay
legible without checking anything out of git.

**Why this exists:** `web_store` is the older of the two frontends (first
committed 2023-02-13, vs `web_app` on 2025-04-26), but it is the only one that
implements the full commerce flow. If it is removed, this file records what was
in it and where to find it again.

**Recovering it:** the code stays in git history in full.

```
git checkout <tag-or-commit> -- web_store
```

---

## Stack

| | |
|---|---|
| Framework | Next.js 15.2.4, **Pages Router** (`pages/`) |
| React | 18.3.1 (declared `^18.2.0`; types pinned at 18.0.x) |
| TypeScript | 4.9.4 |
| UI | MUI v5.10 |
| Auth | Firebase 9.5 client + `firebase-admin` 11.5 + `react-firebase-hooks` 5.1 |
| Payments | `@stripe/stripe-js` 1.54, `@stripe/react-stripe-js` 1.16 |
| Data | `axios` 1.2, `swr` 1.2, `@apollo/client` 3.7 + `graphql` 16.6 |
| Forms | `formik` 2.2 + `yup` 1.0 |

Roughly 116 `.ts`/`.tsx` files.

## Routes (`pages/`)

Commerce — **none of these exist in `web_app`**:

| Route | Purpose |
|---|---|
| `/cart` | Shopping cart |
| `/checkout` | Stripe checkout |
| `/user/orders` | Order history |
| `/user/order/[id]` | Single order detail |
| `/user/payments` | Saved payment methods |
| `/user/address/info` | Address list |
| `/user/address/add` | Add address |
| `/user/address/[id]` | Edit address |
| `/user/favorites` | Bookmarked movies |
| `/user/info` | Account profile |

Catalog and auth — these have equivalents in `web_app`:

`/` (index) · `/movie/[id]` · `/cast/[id]` · `/search/[term]` · `/login`

Next API routes: `/api/get-colors`, `/api/proxy-image`, `/api/hello`.

## Architecture

**Contexts** (`contexts/`) — the app's state backbone:
`AuthContext`, `CartContext`, `BookmarkContext`, `ToastContext`, `BackdropContext`

**Hooks** (`hooks/`):
`useAuthContext`, `useToastContext`, `useInfiniteScroll`, `useOnScreen`, `useDominantColor`

**Models** (`models/`) — 19 TypeScript shapes mirroring the backend DTOs:
`Address`, `Bookmark`, `Cart`, `Cast`, `CastDetails`, `CriticReview`, `Invoice`,
`Item`, `Movie`, `Order`, `Page`, `PaymentMethod`, `RateType`, `Rating`,
`Review`, `Sentiment`, `SentimentState`, `Tag`, `User`

Note `RateType` — a leftover shape for the removed `tax_service`.

**Components** (`components/`, 71 files across 12 groups):

| Group | Files | Notable |
|---|---:|---|
| (root) | 16 | `withAuth` HOC, `Section`, `HorizontalScroll`, `ScrollInfinite`, `ViewType` |
| `actions/` | 9 | `Cart`, `CartButton`, `CartExpanded`, `RateUI`, `Login`, `Logout` |
| `cards/` | 9 | `SimpleCard`, `DetailedCard`, `ReviewCard`, `CriticReviewCard` |
| `order/` | 6 | `OrderCard`, `result`, `resultInfinite`, `toolbar` |
| `carousel/` | 5 | `Carousel`, `Carousel-Item`, `CarouselUpdate` |
| `forms/` | 5 | `Checkout`, `LoginForm`, `AddressForm`, `EditPaymentForm` |
| `invoice/` | 5 | `PaymentStatus`, `AddressSelect`, `AddressForm`, `ItemForm` |
| `navigation/` | 4 | `NavigationBar`, `SearchBar`, `CartNavIcon` |
| `search/` | 4 | `SearchItem`, `result`, `toolbar`, `searchTypes` |
| `cart/` | 3 | `Cart`, `CartItem`, `QuantityButton` |
| `user/` | 3 | `Addresses`, `Payments`, `Bookmarks` |
| `hero/` | 2 | `Hero`, `Hero-Item` |

## Backend integration

Talks to the API gateway, with per-service names resolved through it:

```
NEXT_PUBLIC_API_URL=http://localhost:8760
NEXT_PUBLIC_MOVIE_SERVICE_NAME=movie-service
NEXT_PUBLIC_INVENTORY_SERVICE_NAME=inventory-service
NEXT_PUBLIC_USER_SERVICE_NAME=user-service
NEXT_PUBLIC_ORDER_SERVICE_NAME=order-service
```

Firebase config comes from `NEXT_PUBLIC_FIREBASE_*` env vars.

Auth pattern: `AuthContext` provider wraps the tree, `react-firebase-hooks`
supplies reactive auth state, and the `withAuth` HOC guards protected pages.
(`web_app` instead uses `next-firebase-auth-edge` in edge middleware.)

## If you migrate rather than delete

The gap between the two frontends is almost entirely the commerce surface: cart,
checkout, orders, payment methods, addresses, and favorites — about ten route
groups, plus `CartContext`/`BookmarkContext` and the `cart/`, `forms/`,
`invoice/`, `order/`, and `user/` component groups. Everything else in
`web_store` has a `web_app` equivalent already.
