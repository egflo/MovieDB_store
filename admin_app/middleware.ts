import { NextRequest, NextResponse } from "next/server";
import { authMiddleware, redirectToHome, redirectToLogin } from "next-firebase-auth-edge";
import { clientConfig, serverConfig } from "./lib/firebase/config";
import { isAdmin } from "./lib/auth";

// Everything needs a signed-in admin except the login page.
const PUBLIC_PATHS = ['/login'];

// Signed in, but without the ADMIN role: the only page they can reach, and it
// offers to sign out.
const NOT_AUTHORIZED = '/not-authorized';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    return authMiddleware(request, {
        loginPath: "/api/login",
        logoutPath: "/api/logout",
        refreshTokenPath: "/api/refresh-token",
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        cookieSerializeOptions: serverConfig.cookieSerializeOptions,
        serviceAccount: serverConfig.serviceAccount,
        handleValidToken: async ({decodedToken}, headers) => {
            if (!isAdmin(decodedToken)) {
                if (path === NOT_AUTHORIZED) {
                    return NextResponse.next({request: {headers}});
                }
                return NextResponse.redirect(new URL(NOT_AUTHORIZED, request.url));
            }

            // Admins have no business on the login or not-authorized pages.
            if (path === '/login' || path === NOT_AUTHORIZED) {
                return redirectToHome(request);
            }

            return NextResponse.next({request: {headers}});
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
    matcher: [
        '/api/login',
        '/api/logout',
        '/api/refresh-token',
        '/',
        '/((?!_next|favicon.ico|api|.*\\.).*)'
    ]
};
