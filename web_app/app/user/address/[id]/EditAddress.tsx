'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import { HTTPError } from "ky";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addressesKey, getAddress, updateAddressKeepingDefault } from "@/lib/api/addresses";
import AddressForm from "../AddressForm";
import AddressPage, { ADDRESSES_HREF, PANEL } from "../AddressPage";

/** user_service answers an unknown address id with 400 "No such document!". */
const isNotFound = (error: unknown) =>
    error instanceof HTTPError && (error.response.status === 400 || error.response.status === 404);

function FormSkeleton() {
    const bar = "animate-pulse rounded-xl bg-white/10";
    return (
        <div aria-busy="true" aria-label="Loading address" className={`grid grid-cols-1 gap-4 sm:grid-cols-6 ${PANEL}`}>
            {["sm:col-span-3", "sm:col-span-3", "sm:col-span-6", "sm:col-span-6", "sm:col-span-2", "sm:col-span-2", "sm:col-span-2"].map((span, n) => (
                <div key={n} className={`flex flex-col gap-1.5 ${span}`}>
                    <span className={`h-4 w-20 ${bar}`} />
                    <span className={`h-11 ${bar}`} />
                </div>
            ))}
        </div>
    );
}

export default function EditAddress({ id }: { id: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const { data, isLoading, error } = useSWR(
        user ? ["address", id, user.idToken] : null,
        ([, addressId, token]) => getAddress(token, addressId),
        { revalidateOnFocus: false },
    );

    let body: React.ReactNode;
    if (!user) {
        body = <p className="text-white/70">Please <Link href="/login" className="underline">sign in</Link> to edit this address.</p>;
    } else if (isNotFound(error)) {
        body = <p className="text-white/70">We couldn’t find that address. It may have been deleted.</p>;
    } else if (error) {
        body = <p className="text-white/60">Couldn’t load this address. Try again in a moment.</p>;
    } else if (isLoading || !data) {
        body = <FormSkeleton />;
    } else {
        const { id: _omit, ...initial } = data;
        body = (
            <div className={PANEL}>
                <AddressForm
                    initial={initial}
                    submitLabel="Save changes"
                    cancelHref={ADDRESSES_HREF}
                    onSubmit={async (address) => {
                        await updateAddressKeepingDefault(user.idToken, id, address);
                        // Refresh the cached list and this address (router.refresh()
                        // didn't touch SWR's cache).
                        await Promise.all([
                            mutate(addressesKey(user.idToken)),
                            mutate(["address", id, user.idToken]),
                        ]);
                        router.push(ADDRESSES_HREF);
                    }}
                />
            </div>
        );
    }

    return <AddressPage title="Edit address">{body}</AddressPage>;
}
