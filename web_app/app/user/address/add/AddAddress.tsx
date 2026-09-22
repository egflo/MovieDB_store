'use client';

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/AuthContext";
import { addAddress } from "@/lib/api/addresses";
import AddressForm from "../AddressForm";

export default function AddAddress() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to add an address.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-xl font-medium">Add address</h1>

            <AddressForm
                submitLabel="Save address"
                onSubmit={async (address) => {
                    await addAddress(user.idToken, address);
                    router.push("/user/address/info");
                    router.refresh();
                }}
            />
        </div>
    );
}
