import { authed, url } from "./client";
import { Cart } from "@/lib/models/Cart";

const CART = url("inventory", "cart/");

export function getCart(token: string) {
    return authed(token).get(CART).json<Cart[]>();
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
