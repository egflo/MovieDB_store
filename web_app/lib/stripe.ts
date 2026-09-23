import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe.js, loaded once (loadStripe must not run per render) and shared by
 * checkout and the Add card form. Null when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 * isn't set; it's the publishable key matching order_service's STRIPE_PUBLIC.
 */
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;
