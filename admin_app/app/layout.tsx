import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { clientConfig, serverConfig } from "@/lib/firebase/config";
import { toUser } from "@/lib/firebase/UserInfo";
import { AuthProvider } from "@/lib/firebase/AuthProvider";
import { theme } from "./theme";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: { default: "MovieDB Admin", template: "%s · MovieDB Admin" },
    description: "Manage the MovieDB store.",
    // An admin tool: keep it out of search engines if it's ever deployed.
    robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const tokens = await getTokens(await cookies(), {
        apiKey: clientConfig.apiKey,
        cookieName: serverConfig.cookieName,
        cookieSignatureKeys: serverConfig.cookieSignatureKeys,
        serviceAccount: serverConfig.serviceAccount,
    });
    const user = tokens ? toUser(tokens) : null;

    return (
        <html lang="en" className={geistSans.variable} suppressHydrationWarning>
        <body>
            <AppRouterCacheProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <AuthProvider user={user}>
                        {children}
                    </AuthProvider>
                </ThemeProvider>
            </AppRouterCacheProvider>
        </body>
        </html>
    );
}
