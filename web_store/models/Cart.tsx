

export interface Cart {
    id: number;
    itemId: string;
    userId: string;
    quantity: number;
    created: string;
    price: string;

    movie: {
        id: string;
        title: string;
        poster: string;
        year: number;
    }
}