import ky from "ky";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const SERVICES = {
    movie: process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME,
    inventory: process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME,
    user: process.env.NEXT_PUBLIC_USER_SERVICE_NAME,
    order: process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME,
} as const;

export type Service = keyof typeof SERVICES;

/** Build a gateway URL for a service, e.g. url("inventory", "cart/") */
export function url(service: Service, path = ""): string {
    return `${API_URL}/${SERVICES[service]}/${path}`;
}

/** A ky instance carrying the caller's Firebase ID token. */
export function authed(token?: string | null) {
    return ky.extend({
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        retry: { limit: 2 },
    });
}

/**
 * SWR fetcher for authenticated endpoints. Use with a tuple key so SWR
 * revalidates when the token changes:
 *
 *   useSWR(token ? [url("inventory", "cart/"), token] : null, authedFetcher)
 */
export const authedFetcher = <T>([endpoint, token]: [string, string]) =>
    authed(token).get(endpoint).json<T>();

/** Prices are stored in minor units (cents) across the order/inventory services. */
export function formatPrice(minorUnits: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
    }).format(minorUnits / 100);
}
