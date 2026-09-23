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

/** The SWR key the address pages and the account card share. */
export const addressesKey = (token: string) => ["addresses", token] as const;

const fields = ({ id: _id, ...rest }: Address): Omit<Address, "id"> => rest;

/**
 * Make `id` the only default. user_service saves isDefault exactly as sent and
 * never clears the others (its setDefaultAddress isn't exposed), so several
 * addresses could be default and checkout used whichever Firestore listed
 * first. Sets the new default before clearing the rest, so there's always one.
 */
export async function makeDefaultAddress(token: string, id: string) {
    const addresses = await getAddresses(token);
    const target = addresses.find((a) => a.id === id);
    if (target && !target.isDefault) {
        await updateAddress(token, id, { ...fields(target), isDefault: true });
    }
    await Promise.all(
        addresses
            .filter((a) => a.id !== id && a.isDefault)
            .map((a) => updateAddress(token, a.id!, { ...fields(a), isDefault: false })),
    );
}

/**
 * Delete an address, and if it was the default, make the next one the default
 * so checkout still has one. Returns what was deleted, for Undo.
 */
export async function deleteAddressKeepingDefault(token: string, address: Address) {
    await deleteAddress(token, address.id!);
    if (!address.isDefault) return;
    const rest = await getAddresses(token);
    if (rest.length > 0 && !rest.some((a) => a.isDefault)) {
        await makeDefaultAddress(token, rest[0].id!);
    }
}

/**
 * Save a new address. The first address, or any while none is default,
 * becomes the default; a new default clears the others.
 */
export async function addAddressKeepingDefault(token: string, address: Omit<Address, "id">) {
    const existing = await getAddresses(token);
    const isDefault = address.isDefault || !existing.some((a) => a.isDefault);
    const saved = await addAddress(token, { ...address, isDefault });
    if (isDefault && saved.id) await makeDefaultAddress(token, saved.id);
    return saved;
}

/** Save changes to an address; if it's now the default, clear the others. */
export async function updateAddressKeepingDefault(token: string, id: string, address: Omit<Address, "id">) {
    const saved = await updateAddress(token, id, address);
    if (address.isDefault) await makeDefaultAddress(token, id);
    return saved;
}
