/**
 * An inventory_service product: a movie's price and stock. `id` is the
 * movie's id (movie_service), `sku` its IMDb id. Not the same shape as
 * `Item`, which is a cart or order line.
 */
export interface InventoryProduct {
    id: string;
    sku: string;
    /** Cents. */
    price: number;
    /** Lower-case ISO code, e.g. "usd". */
    currency: string;
    quantity: number;
    status: StockStatus;
    created: string;
    updated: string;
    type?: { id: number; name: string };
}

/** Set by inventory_service from the quantity: 0 is out, under 10 is limited. */
export type StockStatus = "IN_STOCK" | "LIMITED" | "OUT_OF_STOCK";
