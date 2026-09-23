'use client';

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
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

    if (!user) {
        return (
            <div className="p-6">
                <p className="text-lg">
                    Please{" "}
                    <Link href="/login" className="underline">
                        sign in
                    </Link>{" "}
                    to manage your addresses.
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

    if (loadError) {
        return <div className="p-6 text-red-500">Failed to load your addresses.</div>;
    }

    const addresses = data ?? [];

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

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row items-center justify-between">
                <h1 className="text-xl font-medium">Addresses</h1>
                <Button component={Link} href="/user/address/add" variant="contained">
                    Add address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <p className="text-gray-500">You have no saved addresses.</p>
            ) : (
                <div className="flex flex-col gap-3 md:max-w-2xl">
                    {addresses.map((a) => (
                        <Card key={a.id} className="p-4">
                            <div className="flex flex-row items-start justify-between gap-4">
                                <div className="text-sm">
                                    <p className="font-medium">
                                        {a.firstName} {a.lastName}
                                        {a.isDefault && (
                                            <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
                                                Default
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-gray-500">{a.street}</p>
                                    <p className="text-gray-500">
                                        {a.city}, {a.state} {a.postcode}
                                    </p>
                                    <p className="text-gray-500">{a.country}</p>
                                </div>

                                <div className="flex shrink-0 flex-row gap-1">
                                    {!a.isDefault && (
                                        <Button size="small" disabled={busy !== null} onClick={() => makeDefault(a)}>
                                            {busy === a.id ? "Saving…" : "Set as default"}
                                        </Button>
                                    )}
                                    <Button
                                        component={Link}
                                        href={`/user/address/${a.id}`}
                                        size="small"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        disabled={busy !== null}
                                        onClick={() => remove(a)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
