import { HTTPError } from "ky";
import { authed, url } from "./client";
import { Cart } from "@/lib/models/Cart";

const CART = url("inventory", "cart/");

/**
 * Most copies of one title a cart line may hold. Enforced only here (the
 * inventory service has no limit), on the cart page and the add button.
 */
export const MAX_PER_TITLE = 4;

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
    // Sorted by line id (the order they were added): the service returns them
    // in no fixed order, so lines swapped places between loads.
    return [...(cart.items ?? [])].sort((a, b) => a.id - b.id).map((line) => ({
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
 * Add copies of a title. POST /cart/ (CartService.add) finds the line by
 * itemId and *adds* `quantity` to it, creating it if needed. It ignores any
 * line id, so it can't set a quantity: see setCartQuantity.
 */
export function addToCart(token: string, item: { itemId: string; userId: string; quantity: number }) {
    return authed(token).post(CART, { json: item }).json<Cart>();
}

/**
 * Set a line's quantity. POST /cart/{id} (CartService.update) replaces it.
 * The cart page's - and + used to send the new quantity to POST /cart/,
 * which added it on: - on a line of 3 made it 5.
 */
export function setCartQuantity(token: string, id: number, quantity: number) {
    return authed(token).post(`${CART}${id}`, { json: { quantity } }).json<Cart>();
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
