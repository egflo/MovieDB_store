// Display helpers for saved cards. A plain module so any component can use them.

const BRANDS: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "American Express",
    discover: "Discover",
    diners: "Diners Club",
    jcb: "JCB",
    unionpay: "UnionPay",
    cartes_bancaires: "Cartes Bancaires",
};

/** "visa" -> "Visa"; unknown brands are capitalised. */
export const brandName = (brand?: string) =>
    !brand ? "Card" : BRANDS[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1);

/** "04/28", or "" when either part is missing. */
export function expiry(month?: number, year?: number) {
    if (!month || !year) return "";
    return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

/** A card is good through the last day of its expiry month. */
export function isExpired(month?: number, year?: number, now = new Date()) {
    if (!month || !year) return false;
    return year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
}

/** "Visa •••• 4242". Stripe nests the details under `card`; older data had them at the top. */
export function cardName(method: { brand?: string; last4?: string; card?: { brand?: string; last4?: string } }) {
    const card = method.card ?? method;
    return `${brandName(card.brand)} •••• ${card.last4}`;
}
