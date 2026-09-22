'use client';

import React, { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuth } from "@/lib/firebase/AuthContext";
import {
    getPaymentMethods,
    setDefaultPaymentMethod,
    deletePaymentMethod,
} from "@/lib/api/payments";

function expiry(month?: number, year?: number) {
    if (!month || !year) return "";
    return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

export default function Payments() {
    const { user } = useAuth();
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { data, isLoading, error: loadError, mutate } = useSWR(
        user ? ["payment-methods", user.idToken] : null,
        ([, token]) => getPaymentMethods(token),
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
                    to manage your payment methods.
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
        return (
            <div className="p-6 text-red-500">Failed to load your payment methods.</div>
        );
    }

    const methods = data ?? [];

    async function act(id: string, fn: (token: string, id: string) => Promise<unknown>, message: string) {
        if (!user) return;
        setBusy(id);
        setError(null);
        try {
            await fn(user.idToken, id);
            await mutate();
        } catch {
            setError(message);
        } finally {
            setBusy(null);
        }
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            <h1 className="text-xl font-medium">Payment methods</h1>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {methods.length === 0 ? (
                <p className="text-gray-500">
                    No saved cards. A card you use at checkout will be saved here.
                </p>
            ) : (
                <div className="flex flex-col gap-3 md:max-w-2xl">
                    {methods.map((m) => {
                        const card = m.card ?? m;
                        return (
                            <Card key={m.id} className="p-4">
                                <div className="flex flex-row items-center justify-between gap-4">
                                    <div className="text-sm">
                                        <p className="font-medium capitalize">
                                            {card.brand} •••• {card.last4}
                                            {m.isDefault && (
                                                <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-700">
                                                    Default
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-gray-500">
                                            Expires {expiry(card.exp_month, card.exp_year)}
                                        </p>
                                    </div>

                                    <div className="flex shrink-0 flex-row gap-1">
                                        {!m.isDefault && (
                                            <Button
                                                size="small"
                                                disabled={busy === m.id}
                                                onClick={() =>
                                                    act(
                                                        m.id,
                                                        setDefaultPaymentMethod,
                                                        "Could not set that as default",
                                                    )
                                                }
                                            >
                                                Make default
                                            </Button>
                                        )}
                                        <Button
                                            size="small"
                                            color="error"
                                            disabled={busy === m.id}
                                            onClick={() =>
                                                act(
                                                    m.id,
                                                    deletePaymentMethod,
                                                    "Could not remove that card",
                                                )
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
