

// Define a TypeScript interface for InvoiceItem
import {Address} from "./Address";

export interface InvoiceItem {
    id: string;
    itemId: string;
    userId: string;
    quantity: number;
    price: number;
    name: string;
    description: string;
    image: string;
    sku: string;
}

// Define a TypeScript interface for PaymentSheetItem
export interface PaymentSheetItem {
    publishableKey: string;
    customer: string;
    paymentIntent: string;
    ephemeralKey: string;
    paymentIntentId: string;
}

// Define a TypeScript interface for Invoice
export interface Invoice {
    address?: Address; // Optional property
    items: InvoiceItem[]; // Array of InvoiceItem
    total: number; // Corresponds to Swift's Int
    subTotal: number;
    tax: number;
    shipping: number;
    paymentSheet: PaymentSheetItem; // Reference to PaymentSheetItem
}