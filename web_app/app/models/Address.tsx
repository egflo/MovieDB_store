


export interface Address {
    id?: string; // Optional property (similar to Swift's optional)
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}