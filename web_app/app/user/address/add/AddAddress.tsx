'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addAddressKeepingDefault, addressesKey } from "@/lib/api/addresses";
import AddressForm from "../AddressForm";
import AddressPage, { ADDRESSES_HREF, PANEL } from "../AddressPage";

/** Checkout links here with ?from=checkout, so saving goes back to it. */
const CHECKOUT = { href: "/checkout", label: "Checkout" };

export default function AddAddress({ fromCheckout = false }: { fromCheckout?: boolean }) {
    const { user } = useAuth();
    const router = useRouter();
    const back = fromCheckout ? CHECKOUT : { href: ADDRESSES_HREF, label: "Addresses" };

    return (
        <AddressPage title="Add address" back={back}>
            {!user ? (
                <p className="text-white/70">
                    Please <Link href="/login" className="underline">sign in</Link> to add an address.
                </p>
            ) : (
                <div className={PANEL}>
                    <AddressForm
                        submitLabel="Save address"
                        cancelHref={back.href}
                        onSubmit={async (address) => {
                            await addAddressKeepingDefault(user.idToken, address);
                            // Refresh the cached list (router.refresh() didn't touch it),
                            // so the list and the account card show the new address.
                            await mutate(addressesKey(user.idToken));
                            router.push(back.href);
                        }}
                    />
                </div>
            )}
        </AddressPage>
    );
}
