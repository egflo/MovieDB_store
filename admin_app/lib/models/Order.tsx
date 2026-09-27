


    export interface Address {
        id: number;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        /** Shipping.getPostalCode() in order_service, so the JSON says postalCode, not postcode. */
        postalCode: string;
        country: string;
    }

    export interface Item {
        id: number;
        itemId: string;
        quantity: number;
        price: number;
        created: Date;
        updated: Date;
        sku: string;
        photo: string;
        /** The movie's title. */
        description: string;
    }

    export interface Order {
        id: number;
        userId: string;
        paymentId?: any;
        /** Card network, e.g. "visa", "discover". */
        network?: string;
        /** e.g. "card". */
        paymentType?: string;
        /** Lower-case ISO code, e.g. "usd". */
        currency?: string;
        status: string;
        subTotal: number;
        tax: number;
        total: number;
        created: number;
        updated: number;
        /** The shipping address. The shipping cost isn't stored: see orderShippingCost. */
        shipping: Address;
        items: Item[];
    }


