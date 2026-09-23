'use client';

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import CircularProgress from "@mui/material/CircularProgress";
import { Address } from "@/lib/models/Address";
import { EMPTY_ADDRESS } from "@/lib/api/addresses";
import { useToast } from "@/app/components/Toast";
import { COUNTRIES, isUsZip, US_STATES } from "./regions";

type Draft = Omit<Address, "id">;
type Field = Exclude<keyof Draft, "isDefault">;
type Errors = Partial<Record<Field, string>>;

const INPUT =
    "h-11 w-full min-w-0 rounded-xl bg-white/10 px-3.5 text-sm text-white outline-none ring-1 ring-inset ring-white/10 " +
    "placeholder:text-white/35 focus:ring-white/35 aria-[invalid=true]:ring-red-400/60 [&>option]:bg-neutral-900";

/**
 * Labels, autofill hints (the "shipping" section tells the browser which saved
 * address to offer) and grid spans: names side by side, city / state / ZIP on
 * one row from sm up.
 */
const LAYOUT: Record<Field, { label: string; autoComplete: string; span: string }> = {
    firstName: { label: "First name", autoComplete: "shipping given-name", span: "sm:col-span-3" },
    lastName: { label: "Last name", autoComplete: "shipping family-name", span: "sm:col-span-3" },
    country: { label: "Country", autoComplete: "shipping country", span: "sm:col-span-6" },
    street: { label: "Street address", autoComplete: "shipping address-line1", span: "sm:col-span-6" },
    city: { label: "City", autoComplete: "shipping address-level2", span: "sm:col-span-2" },
    state: { label: "State", autoComplete: "shipping address-level1", span: "sm:col-span-2" },
    postcode: { label: "ZIP code", autoComplete: "shipping postal-code", span: "sm:col-span-2" },
};

function validate(draft: Draft): Errors {
    const us = draft.country === "US";
    const errors: Errors = {};
    for (const field of Object.keys(LAYOUT) as Field[]) {
        if (!draft[field].trim()) errors[field] = `${label(field, us)} is required`;
    }
    // Checkout's tax is calculated from the address, so a bad ZIP fails there;
    // catch it here instead.
    if (us && draft.postcode.trim() && !isUsZip(draft.postcode)) {
        errors.postcode = "Enter a 5-digit ZIP code, like 90001 or 90001-1234";
    }
    return errors;
}

/** "ZIP code" / "State" for the US, "Postcode" / "State or region" elsewhere. */
const label = (field: Field, us: boolean) =>
    !us && field === "postcode" ? "Postcode" : !us && field === "state" ? "State or region" : LAYOUT[field].label;

export default function AddressForm({
    initial,
    submitLabel,
    cancelHref,
    onSubmit,
}: {
    initial?: Draft;
    submitLabel: string;
    cancelHref: string;
    onSubmit: (address: Draft) => Promise<void>;
}) {
    const toast = useToast();
    // New addresses start in the US; an existing one keeps whatever it has.
    const [draft, setDraft] = useState<Draft>(initial ?? { ...EMPTY_ADDRESS, country: "US" });
    const [errors, setErrors] = useState<Errors>({});
    const [pending, setPending] = useState(false);
    // Unticking the current default would leave no default, which checkout
    // relies on. Another address has to be made the default instead.
    const lockDefault = Boolean(initial?.isDefault);
    const us = draft.country === "US";

    function set<K extends keyof Draft>(name: K, value: Draft[K]) {
        setDraft((d) => ({ ...d, [name]: value }));
        setErrors((e) => ({ ...e, [name]: undefined }));
    }

    function changeCountry(country: string) {
        // A US state code means nothing elsewhere, and vice versa.
        const keepState = (country === "US") === us;
        setDraft((d) => ({ ...d, country, state: keepState ? d.state : "" }));
        setErrors((e) => ({ ...e, country: undefined, state: undefined, postcode: undefined }));
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (pending) return;
        const trimmed = Object.fromEntries(
            Object.entries(draft).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
        ) as Draft;
        const found = validate(trimmed);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            // Put the cursor in the first field to fix.
            const first = (Object.keys(LAYOUT) as Field[]).find((f) => found[f]);
            if (first) document.getElementById(first)?.focus();
            return;
        }

        setPending(true);
        try {
            await onSubmit(trimmed);
        } catch (e) {
            // Not e.message: that's ky's "Request failed with status code 500 …".
            console.warn("Failed to save address", e);
            toast({ message: "Couldn’t save the address. Try again.", tone: "error" });
        } finally {
            setPending(false);
        }
    }

    // Existing addresses may hold a country or state not in the lists; keep it
    // selectable rather than silently changing it.
    const countries = COUNTRIES.some((c) => c.code === draft.country) || !draft.country
        ? COUNTRIES
        : [...COUNTRIES, { code: draft.country, name: draft.country }];
    const states = !draft.state || US_STATES.some((s) => s.code === draft.state)
        ? US_STATES
        : [...US_STATES, { code: draft.state, name: draft.state }];

    function field(name: Field, control: React.ReactNode) {
        return (
            <div key={name} className={`flex flex-col gap-1.5 ${LAYOUT[name].span}`}>
                <label htmlFor={name} className="text-sm text-white/70">{label(name, us)}</label>
                {control}
                {errors[name] && <p id={`${name}-error`} className="text-xs text-red-300">{errors[name]}</p>}
            </div>
        );
    }
    const common = (name: Field) => ({
        id: name,
        name,
        autoComplete: LAYOUT[name].autoComplete,
        "aria-invalid": Boolean(errors[name]),
        "aria-describedby": errors[name] ? `${name}-error` : undefined,
        className: INPUT,
    });
    const text = (name: Field, props: React.InputHTMLAttributes<HTMLInputElement> = {}) =>
        field(name, <input {...common(name)} {...props} value={draft[name]} onChange={(e) => set(name, e.target.value)} />);

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
                {text("firstName")}
                {text("lastName")}
                {field("country", (
                    <select {...common("country")} value={draft.country} onChange={(e) => changeCountry(e.target.value)}>
                        {!draft.country && <option value="">Choose a country</option>}
                        {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
                    </select>
                ))}
                {text("street", { placeholder: "123 Main St" })}
                {text("city")}
                {us
                    ? field("state", (
                        <select {...common("state")} value={draft.state} onChange={(e) => set("state", e.target.value)}>
                            <option value="">Choose…</option>
                            {states.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                        </select>
                    ))
                    : text("state")}
                {text("postcode", us ? { inputMode: "numeric", placeholder: "90001" } : {})}
            </div>

            <div className="flex flex-col gap-1">
                <label className={`flex items-center gap-2.5 text-sm ${lockDefault ? "text-white/60" : "cursor-pointer"}`}>
                    <input
                        type="checkbox"
                        className="h-4 w-4 accent-white"
                        checked={draft.isDefault}
                        disabled={lockDefault}
                        onChange={(e) => set("isDefault", e.target.checked)}
                    />
                    Use as my default address
                </label>
                {lockDefault && (
                    <p className="pl-6.5 text-xs text-white/50">
                        This is your default. To change it, set another address as the default.
                    </p>
                )}
            </div>

            <div className="flex items-center gap-4 pt-1">
                <button
                    type="submit"
                    disabled={pending}
                    className="flex h-11 min-w-36 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-black transition-colors hover:bg-white/85 disabled:cursor-default disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                >
                    {pending && <CircularProgress size={16} color="inherit" />}
                    {pending ? "Saving…" : submitLabel}
                </button>
                <Link href={cancelHref} className="text-sm text-white/60 underline-offset-4 hover:text-white hover:underline">
                    Cancel
                </Link>
            </div>
        </form>
    );
}
