import { authed, url } from "./client";
import { Address } from "@/lib/models/Address";
import { Invoice } from "@/lib/models/Invoice";
import { Order } from "@/lib/models/Order";
import { Page } from "@/lib/models/Page";

// OrderController is a @RestController with no class-level @RequestMapping,
// so its endpoints sit at the service root.
const INVOICE = url("order", "invoice");
const CREATE = url("order", "create");
const ORDERS = url("order", "");

/** Build an invoice against the user's default saved address. */
export function getInvoice(token: string) {
    return authed(token).get(INVOICE).json<Invoice>();
}

/** Build an invoice against a specific address (recalculates Stripe tax). */
export function getInvoiceFor(token: string, address: Address) {
    return authed(token).post(INVOICE, { json: address }).json<Invoice>();
}

export interface CreateOrderRequest {
    userId: string;
    /** The Stripe PaymentIntent id, from paymentSheet.paymentIntentId. */
    paymentId: string;
    address: {
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    shipping: number;
    subTotal: number;
    tax: number;
    total: number;
    items: {
        itemId: string;
        quantity: number;
        price: number;
        name: string;
        imageUrl: string;
        description: string;
        sku: string;
    }[];
}

export function createOrder(token: string, request: CreateOrderRequest) {
    return authed(token).post(CREATE, { json: request }).json<Order>();
}

export function getOrders(token: string, limit = 20, page = 0) {
    return authed(token)
        .get(`${ORDERS}user/?limit=${limit}&page=${page}`)
        .json<Page<Order>>();
}

export function getOrder(token: string, id: string) {
    return authed(token).get(`${ORDERS}${id}`).json<Order>();
}
