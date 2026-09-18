'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import LogoutIcon from "@mui/icons-material/Logout";
import { app } from "@/lib/firebase/firebase";

/**
 * Signs out of Firebase, then clears the session cookie via the
 * next-firebase-auth-edge logout route so the server layout stops
 * resolving a user.
 */
export function Logout() {
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleLogout() {
        if (pending) return;
        setPending(true);
        setError(null);

        try {
            await signOut(getAuth(app));
            await fetch("/api/logout");
            router.push("/");
            router.refresh();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setPending(false);
        }
    }

    if (pending) {
        return <CircularProgress size={24} />;
    }

    return (
        <div className="flex flex-col items-center">
            <IconButton
                onClick={handleLogout}
                size="large"
                edge="end"
                color="inherit"
                aria-label="Log out"
            >
                <div className="flex flex-row items-center gap-2">
                    <LogoutIcon fontSize="medium" />
                    <span className="block text-base md:hidden">Logout</span>
                </div>
            </IconButton>

            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default Logout;
