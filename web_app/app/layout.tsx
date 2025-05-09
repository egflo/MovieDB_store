import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {cookies, headers} from "next/headers";
import {getTokens} from "next-firebase-auth-edge";
import {clientConfig, serverConfig} from "@/lib/firebase/config";
import {toUser} from "@/lib/firebase/UserInfo";
import {AuthProvider} from "@/lib/firebase/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
            <AuthProvider user={user}>{children}</AuthProvider>
        </body>
        </html>
    );
}
