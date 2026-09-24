'use client';

import React from "react";
import Link from "next/link";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Address } from "@/lib/models/Address";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import { countryName } from "@/app/user/address/regions";
import { DEFAULT_PILL, OPTION, RADIO } from "./option";

/** Back to checkout after saving (see AddAddress). */
const ADD_HREF = "/user/address/add?from=checkout";

function AddressSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <div aria-busy="true" aria-label="Loading addresses" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[0, 1].map((n) => (
                <div key={n} className="flex flex-col gap-2 rounded-xl p-4 ring-1 ring-inset ring-white/10">
                    <span className={`h-4 w-32 ${bar}`} />
                    <span className={`h-3.5 w-40 ${bar}`} />
                    <span className={`h-3.5 w-28 ${bar}`} />
                </div>
            ))}
        </div>
    );
}

/** Shipping address as radio tiles, the default first. */
export default function AddressSelector({ labelledBy, addresses, loading, error, selectedId, onSelect, disabled }: {
    labelledBy: string;
    addresses: Address[];
    loading: boolean;
    error: boolean;
    selectedId?: string;
    onSelect: (id: string) => void;
    disabled: boolean;
}) {
    if (loading) return <AddressSkeleton />;
    if (error) return <p className="text-sm text-white/60">Couldn’t load your addresses. Try again in a moment.</p>;
    if (addresses.length === 0) {
        return (
            <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-white/70">Add a shipping address to check out.</p>
                <Link href={ADD_HREF} className={`${CHIP} pl-2.5 pr-3.5`}>
                    <AddRoundedIcon sx={CHIP_ICON_SIZE} /> Add address
                </Link>
            </div>
        );
    }

    const sorted = [...addresses].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return (
        <div className="flex flex-col gap-3">
            <div role="radiogroup" aria-labelledby={labelledBy} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {sorted.map((a) => (
                    <label key={a.id} className={OPTION}>
                        <input
                            type="radio"
                            name="shipping-address"
                            value={a.id}
                            className={RADIO}
                            checked={a.id === selectedId}
                            disabled={disabled}
                            onChange={() => onSelect(a.id!)}
                        />
                        <span className="flex min-w-0 flex-1 flex-col text-sm">
                            <span className="flex items-start justify-between gap-2">
                                <span className="truncate font-semibold">{a.firstName} {a.lastName}</span>
                                {a.isDefault && <span className={DEFAULT_PILL}>Default</span>}
                            </span>
                            <span className="truncate text-white/70">{a.street}</span>
                            <span className="truncate text-white/70">
                                {[a.city, [a.state, a.postcode].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                            </span>
                            <span className="text-white/70">{countryName(a.country)}</span>
                        </span>
                    </label>
                ))}
            </div>
            <Link href={ADD_HREF} className="w-fit text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                Add another address
            </Link>
        </div>
    );
}
