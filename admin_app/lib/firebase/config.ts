export const serverConfig = {
    cookieName: process.env.AUTH_COOKIE_NAME!,
    cookieSignatureKeys: [process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT!, process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS!],
    cookieSerializeOptions: {
        path: "/",
        httpOnly: true,
        secure: process.env.USE_SECURE_COOKIES === "true",
        sameSite: "lax" as const,
        // 5 days. Ordered seconds-first so the unit is unambiguous: the previous
        // value read as "12 hours" but 12 * 60 * 60 * 24 is 12 days.
        //
        // The cookie carries the refresh token, so this is how long a user stays
        // signed in without re-entering credentials, not how long an ID token
        // lasts — those are refreshed every hour regardless. Shorten it if you
        // want tighter re-authentication; Firebase session cookies cap at 14 days.
        maxAge: 60 * 60 * 24 * 5,
    },
    serviceAccount: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
    }
};

export const clientConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
};