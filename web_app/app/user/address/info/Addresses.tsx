'use client';

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { useAuth } from "@/lib/firebase/AuthContext";
import {
    addAddressKeepingDefault,
    addressesKey,
    deleteAddressKeepingDefault,
    getAddresses,
    makeDefaultAddress,
} from "@/lib/api/addresses";
import { Address } from "@/lib/models/Address";
import { useToast } from "@/app/components/Toast";
import { GLASS_CARD } from "@/app/ui/glass";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import FavoriteBackdrop from "@/app/ui/FavoriteBackdrop";
import { countryName } from "../regions";

const CARD = `flex flex-col gap-4 rounded-2xl p-5 ${GLASS_CARD}`;
const ACTION = "cursor-pointer text-sm text-white/70 transition-colors hover:text-white disabled:cursor-default disabled:opacity-40 disabled:hover:text-white/70";

function AddressesSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <ul aria-busy="true" aria-label="Loading addresses" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((n) => (
                <li key={n} className={CARD}>
                    <span className={`h-4 w-32 ${bar}`} />
                    <div className="flex flex-col gap-2">
                        <span className={`h-3.5 w-40 ${bar}`} />
                        <span className={`h-3.5 w-48 ${bar}`} />
                    </div>
                    <span className={`h-3.5 w-36 ${bar}`} />
                </li>
            ))}
        </ul>
    );
}

export default function Addresses() {
    const { user } = useAuth();
    const toast = useToast();
    // The address being changed; every action waits while one is in flight,
    // since changing the default rewrites several addresses.
    const [busy, setBusy] = useState<string | null>(null);

    const { data, isLoading, error: loadError, mutate } = useSWR(
        user ? addressesKey(user.idToken) : null,
        ([, token]) => getAddresses(token),
        { revalidateOnFocus: false },
    );

    async function run(id: string, action: (token: string) => Promise<unknown>, failure: string) {
        if (!user || busy) return false;
        setBusy(id);
        try {
            await action(user.idToken);
            return true;
        } catch (e) {
            console.warn(failure, e);
            toast({ message: `${failure}. Try again.`, tone: "error" });
            return false;
        } finally {
            await mutate();
            setBusy(null);
        }
    }

    const makeDefault = (a: Address) =>
        run(a.id!, (token) => makeDefaultAddress(token, a.id!), "Couldn’t change your default address");

    // No confirm step: Undo puts it back (as a new address with the same
    // details, and the default again if it was).
    async function remove(a: Address) {
        const done = await run(a.id!, (token) => deleteAddressKeepingDefault(token, a), "Couldn’t delete that address");
        if (!done) return;
        const { id: _id, ...fields } = a;
        toast({
            message: `Deleted ${a.street}`,
            action: {
                label: "Undo",
                onClick: () => { run("undo", (token) => addAddressKeepingDefault(token, fields), "Couldn’t restore that address"); },
            },
        });
    }

    // The default first; the rest in the service's order.
    const addresses = [...(data ?? [])].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));

    let body: React.ReactNode;
    if (!user) {
        body = <p className="py-10 text-white/70">Please <Link href="/login" className="underline">sign in</Link> to manage your addresses.</p>;
    } else if (isLoading) {
        body = <AddressesSkeleton />;
    } else if (loadError) {
        body = <p className="py-10 text-white/60">Couldn’t load your addresses. Try again in a moment.</p>;
    } else if (addresses.length === 0) {
        body = (
            <div className="flex flex-col items-start gap-3 py-10">
                <p className="text-white/70">No saved addresses yet. Add one to check out faster.</p>
                <Link href="/user/address/add" className={`${CHIP} pl-2.5 pr-3.5`}>
                    <AddRoundedIcon sx={CHIP_ICON_SIZE} /> Add address
                </Link>
            </div>
        );
    } else {
        body = (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {addresses.map((a) => (
                    <li key={a.id} className={`${CARD} transition-opacity ${busy === a.id ? "opacity-60" : ""}`}>
                        <div className="flex items-start justify-between gap-3">
                            <p className="font-semibold">{a.firstName} {a.lastName}</p>
                            {a.isDefault && (
                                <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/85 ring-1 ring-inset ring-white/15">
                                    Default
                                </span>
                            )}
                        </div>
                        <address className="flex flex-1 flex-col text-sm not-italic text-white/70">
                            <span>{a.street}</span>
                            <span>{[a.city, [a.state, a.postcode].filter(Boolean).join(" ")].filter(Boolean).join(", ")}</span>
                            <span>{countryName(a.country)}</span>
                        </address>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3">
                            <Link href={`/user/address/${a.id}`} className={ACTION}>Edit</Link>
                            {!a.isDefault && (
                                <button type="button" className={ACTION} disabled={busy !== null} onClick={() => makeDefault(a)}>
                                    Set as default
                                </button>
                            )}
                            <button
                                type="button"
                                className={`${ACTION} ml-auto hover:text-red-300`}
                                disabled={busy !== null}
                                onClick={() => remove(a)}
                                aria-label={`Delete ${a.street}`}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    return (
        // isolate keeps the backdrop's -z-10 inside this page.
        <main className="relative isolate mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 pb-16 pt-8 text-white">
            <FavoriteBackdrop />
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-semibold tracking-tight">Addresses</h1>
                    <p className="h-5 text-sm text-white/60">
                        {user && data && data.length > 0 && `${data.length} saved`}
                    </p>
                </div>
                {user && addresses.length > 0 && (
                    <Link href="/user/address/add" className={`${CHIP} pl-2.5 pr-3.5`}>
                        <AddRoundedIcon sx={CHIP_ICON_SIZE} /> Add address
                    </Link>
                )}
            </header>
            {body}
        </main>
    );
}
