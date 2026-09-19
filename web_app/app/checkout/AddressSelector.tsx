'use client';

import React from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import { Address } from "@/lib/models/Address";

export default function AddressSelector({
    addresses,
    selectedId,
    onSelect,
}: {
    addresses: Address[];
    selectedId?: string;
    onSelect: (address: Address) => void;
}) {
    if (addresses.length === 0) {
        return (
            <Card className="p-4">
                <p className="text-sm text-gray-500">
                    You need a shipping address before checking out.
                </p>
                <Link href="/user/address/add" className="text-sm underline">
                    Add an address
                </Link>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            {addresses.map((a) => {
                const selected = a.id === selectedId;
                return (
                    <Card
                        key={a.id}
                        onClick={() => onSelect(a)}
                        className={`cursor-pointer p-3 ${
                            selected ? "ring-2 ring-blue-500" : ""
                        }`}
                    >
                        <label className="flex cursor-pointer flex-row items-start gap-3">
                            <input
                                type="radio"
                                name="shipping-address"
                                className="mt-1"
                                checked={selected}
                                onChange={() => onSelect(a)}
                            />
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
                        </label>
                    </Card>
                );
            })}

            <Link href="/user/address/add" className="text-sm underline">
                Add another address
            </Link>
        </div>
    );
}
