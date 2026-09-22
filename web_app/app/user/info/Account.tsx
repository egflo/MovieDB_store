'use client';

import React from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import CreditCardOutlined from "@mui/icons-material/CreditCardOutlined";
import { useAuth } from "@/lib/firebase/AuthContext";
import ProfileImage from "@/app/components/ProfileImage";
import { Logout } from "@/app/components/actions/Logout";

const SECTIONS = [
    {
        href: "/user/orders",
        title: "Orders",
        subtitle: "Track and review past purchases",
        Icon: ReceiptLongOutlined,
    },
    {
        href: "/user/favorites",
        title: "Favorites",
        subtitle: "Movies you have saved",
        Icon: FavoriteBorderOutlined,
    },
    {
        href: "/user/address/info",
        title: "Addresses",
        subtitle: "Where your orders ship",
        Icon: HomeOutlined,
    },
    {
        href: "/user/payments",
        title: "Payment methods",
        subtitle: "Saved cards",
        Icon: CreditCardOutlined,
    },
];

export default function Account() {
    const { user } = useAuth();

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to view your account.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:max-w-3xl">
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-row items-center gap-4">
                    <ProfileImage
                        name={user.displayName ?? user.email ?? "You"}
                        imageUrl={user.photoURL ?? undefined}
                        size={64}
                        className="rounded-full"
                    />
                    <div>
                        <h1 className="text-xl font-medium">
                            {user.displayName ?? "Your account"}
                        </h1>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {!user.emailVerified && (
                            <p className="text-xs text-amber-600">Email not verified</p>
                        )}
                    </div>
                </div>

                <Logout />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SECTIONS.map(({ href, title, subtitle, Icon }) => (
                    <Link key={href} href={href}>
                        <Card className="h-full hover:shadow-lg">
                            <CardContent className="flex flex-row items-center gap-4">
                                <Icon sx={{ fontSize: 40 }} />
                                <div>
                                    <p className="font-medium">{title}</p>
                                    <p className="text-sm text-gray-500">{subtitle}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
