'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addAddressKeepingDefault, addressesKey } from "@/lib/api/addresses";
import AddressForm from "../AddressForm";
import AddressPage, { ADDRESSES_HREF, PANEL } from "../AddressPage";

export default function AddAddress() {
    const { user } = useAuth();
    const router = useRouter();

    return (
        <AddressPage title="Add address">
            {!user ? (
                <p className="text-white/70">
                    Please <Link href="/login" className="underline">sign in</Link> to add an address.
                </p>
            ) : (
                <div className={PANEL}>
                    <AddressForm
                        submitLabel="Save address"
                        cancelHref={ADDRESSES_HREF}
                        onSubmit={async (address) => {
                            await addAddressKeepingDefault(user.idToken, address);
                            // Refresh the cached list (router.refresh() didn't touch it),
                            // so the list and the account card show the new address.
                            await mutate(addressesKey(user.idToken));
                            router.push(ADDRESSES_HREF);
                        }}
                    />
                </div>
            )}
        </AddressPage>
    );
}
