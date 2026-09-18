


export interface Address {
    id?: string; // Optional property (similar to Swift's optional)
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    country: string;
    // The API field is `postcode`. web_store declared this as `postalCode`,
    // so it silently never bound in either direction.
    postcode: string;
    isDefault: boolean;
}