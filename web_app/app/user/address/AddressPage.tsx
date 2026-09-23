'use client';

import React from "react";
import Link from "next/link";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";

export const ADDRESSES_HREF = "/user/address/info";
export const PANEL = `rounded-2xl p-5 sm:p-6 ${GLASS_CARD}`;

/** The add and edit pages' frame: backdrop, back chip, heading, then the panel. */
export default function AddressPage({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <Link href={ADDRESSES_HREF} className={`${CHIP} w-fit pl-2 pr-3.5`}>
                <ChevronLeftRoundedIcon sx={CHIP_ICON_SIZE} /> Addresses
            </Link>
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <div className="w-full max-w-2xl">{children}</div>
        </main>
    );
}
