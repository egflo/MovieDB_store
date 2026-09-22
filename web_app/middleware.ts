import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "./lib/firebase/config";

// next-firebase-auth-edge compares string entries with ===, so "/movie/[id]"
// never matched anything: no real pathname is literally that. Anything with a
// parameter has to be a RegExp.
//
// Browsing is public; only the cart, checkout and /user/* need a session.
const PUBLIC_PATHS: (string | RegExp)[] = [
    '/',
    '/login',
    '/register',
    '/search',
    /^\/movie\/.+/,
    /^\/cast\/.+/,
];

// Signed-in users are bounced off these; the rest of PUBLIC_PATHS stays
// reachable, or '/' would redirect to itself forever.
const AUTH_PAGES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    return authMiddleware(request, {
        loginPath: "/api/login",
        logoutPath: "/api/logout",
        refreshTokenPath: "/api/refresh-token",
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        cookieSerializeOptions: serverConfig.cookieSerializeOptions,
        serviceAccount: serverConfig.serviceAccount,
        handleValidToken: async ({token, decodedToken}, headers) => {
            if (AUTH_PAGES.includes(request.nextUrl.pathname)) {
                return redirectToHome(request);
            }

            return NextResponse.next({
                request: {
                    headers
                }
            });
        },
        handleInvalidToken: async (reason) => {
            console.info('Missing or malformed credentials', {reason});

            return redirectToLogin(request, {
                path: '/login',
                publicPaths: PUBLIC_PATHS
            });
        },
        handleError: async (error) => {
            console.error('Unhandled authentication error', {error});

            return redirectToLogin(request, {
                path: '/login',
                publicPaths: PUBLIC_PATHS
            });
        }
    });
}

export const config = {
    // Make sure to include the path in `matcher`
    matcher: [
        '/api/login',
        '/api/logout',
        '/api/refresh-token',
        '/',
        '/((?!_next|favicon.ico|api|.*\\.).*)'
    ]
};