import ky from "ky";
import { getValidIdToken } from "next-firebase-auth-edge/lib/next/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const REFRESH_TOKEN_URL = "/api/refresh-token";

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

/**
 * Exchange the server-rendered ID token for a currently-valid one.
 *
 * `user.idToken` from AuthProvider is a snapshot taken during server render,
 * and Firebase ID tokens expire after an hour. getValidIdToken decodes the JWT
 * locally and only calls the refresh endpoint once it has actually expired,
 * caching the result, so this is cheap to call on every request.
 *
 * Client-side only — the refresh endpoint is a relative URL served by the
 * middleware.
 */
export async function freshToken(serverIdToken: string): Promise<string> {
    if (typeof window === "undefined") return serverIdToken;

    try {
        const token = await getValidIdToken({
            serverIdToken,
            refreshTokenUrl: REFRESH_TOKEN_URL,
        });
        return token ?? serverIdToken;
    } catch {
        // Fall back to the original token; the request will 401 and the caller
        // surfaces that, rather than the whole call failing here.
        return serverIdToken;
    }
}

/**
 * A ky instance that attaches a valid Firebase ID token to every request.
 *
 * The token is resolved in a beforeRequest hook rather than baked into the
 * headers, so a long-lived page keeps working past the one-hour expiry without
 * any call site having to think about it.
 */
export function authed(token?: string | null) {
    return ky.extend({
        retry: { limit: 2 },
        hooks: {
            beforeRequest: [
                async (request) => {
                    if (!token) return;
                    request.headers.set(
                        "Authorization",
                        `Bearer ${await freshToken(token)}`,
                    );
                },
            ],
        },
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
