import type { Metadata } from "next";

// The sign-in and not-authorized pages are client components, which can't
// export metadata themselves.
export const metadata: Metadata = { title: "Sign in" };

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}
