"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useAuth } from "@/lib/firebase/AuthContext";
import { signOut } from "@/lib/firebase/signOut";

/**
 * Where the middleware sends a signed-in account without the ADMIN role
 * (e.g. a session from before the role was revoked).
 */
export default function NotAuthorized() {
    const { user } = useAuth();
    const [pending, setPending] = useState(false);

    async function handleSignOut() {
        setPending(true);
        try {
            await signOut();
        } catch (e) {
            console.warn("Sign out failed", e);
            setPending(false);
        }
    }

    return (
        <Box component="main" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
            <Card sx={{ width: "100%", maxWidth: 440 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" fontWeight={600} gutterBottom>
                        No admin access
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {user?.email ? <><strong>{user.email}</strong> is signed in, but it</> : "This account"}{" "}
                        doesn’t have the admin role. Sign out and use an admin account.
                    </Typography>
                    <Button variant="contained" onClick={handleSignOut} disabled={pending}>
                        {pending ? "Signing out" : "Sign out"}
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}
