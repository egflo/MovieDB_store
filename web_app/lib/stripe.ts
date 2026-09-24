import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe.js, loaded once (loadStripe must not run per render) and shared by
 * checkout and the Add card form. Null when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
 * isn't set; it's the publishable key matching order_service's STRIPE_PUBLIC.
 */
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export const stripePromise = PUBLISHABLE_KEY ? loadStripe(PUBLISHABLE_KEY) : null;

/** The Payment Element's look on the site's dark glass panels. */
export const STRIPE_APPEARANCE = {
    theme: "night" as const,
    variables: {
        colorBackground: "#262626",
        colorText: "#ffffff",
        borderRadius: "12px",
        fontSizeBase: "14px",
    },
};
