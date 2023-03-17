

    export interface Item {
        id: number;
        itemId: string;
        userId: string;
        quantity: number;
        price: number;
        name: string;
        description: string;
        image: string;
        sku: string;
    }

    export interface Checkout {
        userId: string;
        createdAt: Date;
        total: number;
        tax: number;
        shipping: number;
        subTotal: number;
        clientSecret: string;
        paymentIntentId: string;
        items: Item[];
    }


