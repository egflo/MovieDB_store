'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addressesKey, getAddress, updateAddressKeepingDefault } from "@/lib/api/addresses";
import AddressForm from "../AddressForm";

export default function EditAddress({ id }: { id: string }) {
    const { user } = useAuth();
    const router = useRouter();

    const { data, isLoading, error } = useSWR(
        user ? ["address", id, user.idToken] : null,
        ([, addressId, token]) => getAddress(token, addressId),
        { revalidateOnFocus: false },
    );

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to edit this address.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-10">
                <CircularProgress />
            </div>
        );
    }

    if (error || !data) {
        return <div className="p-6 text-red-500">Could not load that address.</div>;
    }

    const { id: _omit, ...initial } = data;

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-xl font-medium">Edit address</h1>

            <AddressForm
                initial={initial}
                submitLabel="Save changes"
                onSubmit={async (address) => {
                    await updateAddressKeepingDefault(user.idToken, id, address);
                    // Refresh the cached list and this address (router.refresh()
                    // didn't touch SWR's cache).
                    await Promise.all([
                        mutate(addressesKey(user.idToken)),
                        mutate(["address", id, user.idToken]),
                    ]);
                    router.push("/user/address/info");
                }}
            />
        </div>
    );
}
