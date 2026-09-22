


export interface PaymentMethod{
    id: string;
    brand: string;
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    last4: string;
    network: string[];
    card: Card;
    isDefault: boolean;
}

interface Card {
    brand: string;
    country: string;
    exp_month: number;
    exp_year: number;
    fingerprint: string;
    funding: string;
    last4: string;
    network: string[];
}

