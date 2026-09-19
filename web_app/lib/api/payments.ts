import { authed, url } from "./client";
import { PaymentMethod } from "@/lib/models/PaymentMethod";

/**
 * PaymentController repeats its mapping the same way AddressController does:
 * @RequestMapping("/payment-methods") on the class and "/payment-methods" again
 * on each method, so the real path is doubled.
 */
const PAYMENTS = url("order", "payment-methods/payment-methods");

export function getPaymentMethods(token: string) {
    return authed(token).get(PAYMENTS).json<PaymentMethod[]>();
}

export function setDefaultPaymentMethod(token: string, id: string) {
    return authed(token).post(`${PAYMENTS}/default/${id}`);
}

/** Attaching an existing Stripe payment method id is a PUT. */
export function addPaymentMethod(token: string, id: string) {
    return authed(token).put(`${PAYMENTS}/${id}`);
}

export function deletePaymentMethod(token: string, id: string) {
    return authed(token).delete(`${PAYMENTS}/${id}`);
}
