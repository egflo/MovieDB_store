'use client';

import React, { FormEvent, useState } from "react";
import Button from "@mui/material/Button";
import { Address } from "@/lib/models/Address";
import { EMPTY_ADDRESS } from "@/lib/api/addresses";
import { useToast } from "@/app/components/Toast";

type Draft = Omit<Address, "id">;

const FIELDS: { name: keyof Draft; label: string; required: boolean }[] = [
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "street", label: "Street", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "postcode", label: "Postcode", required: true },
    { name: "country", label: "Country", required: true },
];

export default function AddressForm({
    initial,
    submitLabel,
    onSubmit,
}: {
    initial?: Draft;
    submitLabel: string;
    onSubmit: (address: Draft) => Promise<void>;
}) {
    const toast = useToast();
    const [draft, setDraft] = useState<Draft>(initial ?? EMPTY_ADDRESS);
    const [errors, setErrors] = useState<Partial<Record<keyof Draft, string>>>({});
    const [pending, setPending] = useState(false);
    // Unticking the current default would leave no default, which checkout
    // relies on. Another address has to be made the default instead.
    const lockDefault = Boolean(initial?.isDefault);

    function set<K extends keyof Draft>(name: K, value: Draft[K]) {
        setDraft((d) => ({ ...d, [name]: value }));
        setErrors((e) => ({ ...e, [name]: undefined }));
    }

    function validate(): boolean {
        const next: Partial<Record<keyof Draft, string>> = {};
        for (const f of FIELDS) {
            if (f.required && !String(draft[f.name] ?? "").trim()) {
                next[f.name] = `${f.label} is required`;
            }
        }
        setErrors(next);
        return Object.keys(next).length === 0;
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!validate() || pending) return;

        setPending(true);
        try {
            await onSubmit(draft);
        } catch (e) {
            // Not e.message: that's ky's "Request failed with status code 500 …".
            console.warn("Failed to save address", e);
            toast({ message: "Couldn’t save the address. Try again.", tone: "error" });
        } finally {
            setPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex max-w-xl flex-col gap-4">
            {FIELDS.map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                    <label htmlFor={f.name} className="text-sm font-medium">
                        {f.label}
                    </label>
                    <input
                        id={f.name}
                        name={f.name}
                        value={String(draft[f.name] ?? "")}
                        onChange={(e) => set(f.name, e.target.value as Draft[typeof f.name])}
                        className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    {errors[f.name] && (
                        <p className="text-xs text-red-500">{errors[f.name]}</p>
                    )}
                </div>
            ))}

            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={draft.isDefault}
                    disabled={lockDefault}
                    onChange={(e) => set("isDefault", e.target.checked)}
                />
                Use as my default address
            </label>
            {lockDefault && (
                <p className="-mt-2 text-xs text-gray-400">
                    This is your default. To change it, set another address as the default.
                </p>
            )}

            <Button type="submit" variant="contained" disabled={pending}>
                {pending ? "Saving…" : submitLabel}
            </Button>
        </form>
    );
}
