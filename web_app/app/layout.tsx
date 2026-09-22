import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {cookies, headers} from "next/headers";
import {getTokens} from "next-firebase-auth-edge";
import {clientConfig, serverConfig} from "@/lib/firebase/config";
import {toUser} from "@/lib/firebase/UserInfo";
import {AuthProvider} from "@/lib/firebase/AuthProvider";
import {CartProvider} from "@/lib/context/CartContext";
import {BookmarkProvider} from "@/lib/context/BookmarkContext";
import {Suspense} from "react";
import NavBar from "@/app/components/NavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Pages that export their own title get "<title> · MovieDB".
  title: { default: "MovieDB", template: "%s · MovieDB" },
  description: "Browse, review and buy movies.",
};

export default async function RootLayout({
                                             children,
                                         }: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies(); // Await cookies() here
    const tokens = await getTokens(cookieStore, {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
        headers: await headers(),
    });

    const user = tokens ? toUser(tokens) : null;
    return (
        <html lang="en">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <AuthProvider user={user}>
                <CartProvider>
                    <BookmarkProvider>
                        {/* NavBar reads search params, which needs a Suspense boundary. */}
                        <Suspense fallback={null}>
                            <NavBar />
                        </Suspense>
                        {children}
                    </BookmarkProvider>
                </CartProvider>
            </AuthProvider>
        </body>
        </html>
    );
}
