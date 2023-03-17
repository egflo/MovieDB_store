

export interface Cart {
    id: number;
    itemId: string;
    userId: string;
    quantity: number;
    created: string;
    price: number;

    movie: {
        id: string;
        title: string;
        poster: string;
        year: number;
    }
}