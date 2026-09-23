import { HTTPError } from "ky";
import { authed, url } from "./client";
import { Cart } from "@/lib/models/Cart";

const CART = url("inventory", "cart/");

/** GET /cart/ as the inventory service actually returns it. */
interface CartResponse {
    id: number;
    userId: string;
    created: string;
    items?: {
        id: number;
        itemId: string;
        itemName: string;
        itemDescription?: string;
        itemImageUrl?: string;
        quantity: number;
        price: number;
    }[];
}

/**
 * The signed-in user's cart lines. The service returns one cart object with an
 * `items` array, and a 404 when the user has no cart yet. This used to be read
 * as a bare Cart[], so for anyone with items in their cart `items.reduce` threw
 * inside CartProvider, which wraps the root layout: every page crashed as soon
 * as they signed in. Each line is mapped to the Cart shape the UI reads.
 */
export async function getCart(token: string): Promise<Cart[]> {
    let cart: CartResponse;
    try {
        cart = await authed(token).get(CART).json<CartResponse>();
    } catch (e) {
        if (e instanceof HTTPError && e.response.status === 404) return [];
        throw e;
    }
    return (cart.items ?? []).map((line) => ({
        id: line.id,
        itemId: line.itemId,
        userId: cart.userId,
        quantity: line.quantity,
        price: line.price,
        created: cart.created,
        movie: {
            id: line.itemId,
            title: line.itemName,
            poster: line.itemImageUrl ?? '',
        },
    }));
}

/**
 * Upsert a cart line. The inventory service treats POST /cart/ as an upsert
 * keyed on the row id, so omit `id` to add and pass it to change quantity.
 */
export function saveCartItem(
    token: string,
    item: { id?: number; userId: string; itemId: string; quantity: number },
) {
    return authed(token).post(CART, { json: item }).json<Cart>();
}

export function deleteCartItem(token: string, id: number) {
    return authed(token).delete(`${CART}${id}`);
}

export function cartSubtotal(items: Cart[]): number {
    return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartCount(items: Cart[]): number {
    return items.reduce((sum, i) => sum + i.quantity, 0);
}
