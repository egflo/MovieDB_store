'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";
import LogoutIcon from "@mui/icons-material/Logout";
import { app } from "@/lib/firebase/firebase";
import { CHIP, CHIP_ICON_SIZE } from "@/app/ui/chip";
import { useToast } from "@/app/components/Toast";

/**
 * Signs out of Firebase, then clears the session cookie via the
 * next-firebase-auth-edge logout route so the server layout stops
 * resolving a user. Drawn as a labelled chip: it used to be a bare icon.
 */
export function Logout() {
    const router = useRouter();
    const toast = useToast();
    const [pending, setPending] = useState(false);

    async function handleLogout() {
        if (pending) return;
        setPending(true);

        try {
            await signOut(getAuth(app));
            await fetch("/api/logout");
            router.push("/");
            router.refresh();
        } catch (e) {
            console.warn("Sign out failed", e);
            toast({ message: "Couldn’t sign you out. Try again.", tone: "error" });
        } finally {
            setPending(false);
        }
    }

    return (
        <button type="button" onClick={handleLogout} disabled={pending} className={`${CHIP} cursor-pointer pl-3 pr-3.5`}>
            {pending
                ? <CircularProgress size={16} color="inherit" aria-label="Signing out" />
                : <LogoutIcon sx={CHIP_ICON_SIZE} />}
            Sign out
        </button>
    );
}
