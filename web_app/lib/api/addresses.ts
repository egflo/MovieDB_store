import { authed, url } from "./client";
import { Address } from "@/lib/models/Address";

/**
 * The user's address book lives in user_service (order_service reads it over
 * gRPC when building an invoice). Its controller maps @RequestMapping("/address")
 * at the class and "/address" again on each method, so the real path is doubled.
 * web_store called ORDER_SERVICE/users/address, which matches no mapping at all.
 */
const ADDRESS = url("user", "address/address");

/** The gateway decodes the Firebase token and injects the `uid` header
 *  downstream, so the Bearer token is all a caller needs to send. */

export function getAddresses(token: string) {
    return authed(token).get(ADDRESS).json<Address[]>();
}

export function getAddress(token: string, id: string) {
    return authed(token).get(`${ADDRESS}/${id}`).json<Address>();
}

export function addAddress(token: string, address: Omit<Address, "id">) {
    return authed(token).post(ADDRESS, { json: address }).json<Address>();
}

/** Update is a POST to the item path, not a PUT. */
export function updateAddress(token: string, id: string, address: Omit<Address, "id">) {
    return authed(token).post(`${ADDRESS}/${id}`, { json: address }).json<Address>();
}

export function deleteAddress(token: string, id: string) {
    return authed(token).delete(`${ADDRESS}/${id}`);
}

export const EMPTY_ADDRESS: Omit<Address, "id"> = {
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    isDefault: false,
};
