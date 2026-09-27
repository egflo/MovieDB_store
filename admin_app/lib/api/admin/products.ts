import ky, { HTTPError } from "ky";
import useSWR from "swr";
import { url } from "@/lib/api/client";
import { InventoryProduct } from "@/lib/models/InventoryProduct";
import { Movie } from "@/lib/models/Movie";
import { Page } from "@/lib/models/Page";

/**
 * A product is two records: the movie (movie_service: title, poster, genres)
 * and its price and stock (inventory_service, keyed by the movie's id). The
 * list pages through movie_service's search and looks up each row's stock.
 */

export const PRODUCT_SORTS = {
    popular: { label: "Popular", sortBy: "popularity", direction: 0 },
    newest: { label: "Newest", sortBy: "year", direction: 0 },
    oldest: { label: "Oldest", sortBy: "year", direction: 1 },
    votes: { label: "Most rated", sortBy: "ratings.numOfVotes", direction: 0 },
    priceLow: { label: "Price: low to high", sortBy: "price", direction: 1 },
    priceHigh: { label: "Price: high to low", sortBy: "price", direction: 0 },
} as const;

export type ProductSort = keyof typeof PRODUCT_SORTS;

export function isProductSort(value: string | null): value is ProductSort {
    return value !== null && value in PRODUCT_SORTS;
}

/**
 * Rows per page. Kept at 10 because each row costs one inventory lookup and
 * inventory's rate limiter allows 10 per second in total, shared with the
 * store (WORKPLAN item 42; a batch endpoint would lift this).
 */
export const PRODUCTS_PER_PAGE = 10;

export interface ProductQuery {
    text: string;
    sort: ProductSort;
    /** 0-based. */
    page: number;
}

export function productSearchUrl({ text, sort, page }: ProductQuery): string {
    const { sortBy, direction } = PRODUCT_SORTS[sort];
    const params = new URLSearchParams({
        limit: String(PRODUCTS_PER_PAGE),
        page: String(page),
        sortBy,
        direction: String(direction),
    });
    if (text.trim()) params.set("query", text.trim());
    return url("movie", `movie/search?${params}`);
}

/** Public GETs: movie search and inventory products need no token. */
const publicApi = ky.create({
    retry: {
        // Inventory's rate limiter answers 500 when it's over its limit;
        // back off and try again rather than showing an error.
        limit: 3,
        methods: ["get"],
        statusCodes: [429, 500, 503],
        backoffLimit: 2000,
    },
});

const jsonFetcher = <T>(endpoint: string) => publicApi.get(endpoint).json<T>();

export function useProductSearch(query: ProductQuery) {
    return useSWR<Page<Movie>>(productSearchUrl(query), jsonFetcher, { keepPreviousData: true });
}

export function useMovie(id: string) {
    return useSWR<Movie>(url("movie", `movie/${encodeURIComponent(id)}`), jsonFetcher);
}

// At most this many inventory lookups in flight, so a page of rows doesn't
// burst past the rate limiter.
const MAX_IN_FLIGHT = 3;
let inFlight = 0;
const waiting: (() => void)[] = [];

async function throttled<T>(task: () => Promise<T>): Promise<T> {
    if (inFlight >= MAX_IN_FLIGHT) await new Promise<void>((resolve) => waiting.push(resolve));
    inFlight++;
    try {
        return await task();
    } finally {
        inFlight--;
        waiting.shift()?.();
    }
}

export function inventoryUrl(id: string): string {
    return url("inventory", `product/${encodeURIComponent(id)}`);
}

/** The movie's price and stock, or null if it has no inventory record (404). */
async function fetchInventory(endpoint: string): Promise<InventoryProduct | null> {
    return throttled(async () => {
        try {
            return await publicApi.get(endpoint).json<InventoryProduct>();
        } catch (e) {
            if (e instanceof HTTPError && e.response.status === 404) return null;
            throw e;
        }
    });
}

export function useInventory(id: string | null) {
    return useSWR<InventoryProduct | null>(id ? inventoryUrl(id) : null, fetchInventory, {
        // Rows scroll in and out as pages change; don't refetch on every focus.
        revalidateOnFocus: false,
    });
}
