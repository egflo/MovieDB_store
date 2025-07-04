


    export interface Address {
        id: number;
        firstName: string;
        lastName: string;
        street: string;
        city: string;
        state: string;
        postcode: string;
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
        description: string;
    }

    export interface Order {
        id: number;
        userId: string;
        paymentId?: any;
        status: string;
        subTotal: number;
        tax: number;
        total: number;
        created: number;
        updated: number;
        shipping: Address;
        items: Item[];
    }


