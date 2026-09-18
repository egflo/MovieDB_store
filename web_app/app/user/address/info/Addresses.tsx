'use client';

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import { getAddresses, deleteAddress } from "@/lib/api/addresses";

export default function Addresses() {
    const { user } = useAuth();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data, isLoading, error: loadError, mutate } = useSWR(
        user ? ["addresses", user.idToken] : null,
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

    async function remove(id: string) {
        if (!user) return;
        setBusy(id);
        setError(null);
        try {
            await deleteAddress(user.idToken, id);
            await mutate();
        } catch {
            setError("Could not delete that address");
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-row items-center justify-between">
                <h1 className="text-xl font-medium">Addresses</h1>
                <Button component={Link} href="/user/address/add" variant="contained">
                    Add address
                </Button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

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
                                        disabled={busy === a.id}
                                        onClick={() => a.id && remove(a.id)}
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
