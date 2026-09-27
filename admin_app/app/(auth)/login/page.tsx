"use client";

import { FormEvent, useState } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { app } from "@/lib/firebase/firebase";
import { friendlyError } from "@/lib/firebase/errors";
import { isAdmin } from "@/lib/auth";

/**
 * Where to go after signing in: the page the middleware sent us here from
 * (?redirect=/orders), if it's a path on this site, else the dashboard.
 */
function afterSignIn(): string {
    const target = new URLSearchParams(window.location.search).get("redirect") ?? "";
    // "//host" and "/\host" would leave the site.
    return /^\/(?![/\\])/.test(target) ? target : "/";
}

/** Thrown for a valid account that lacks the ADMIN role. */
class NotAdminError extends Error {}

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");
        setPending(true);

        const auth = getAuth(app);
        try {
            const credential = await signInWithEmailAndPassword(auth, email, password);

            // Check the role before creating a session, so a store customer
            // gets a clear message here rather than a session they can't use.
            // The middleware and the gateway check it again on every request.
            const { claims, token } = await credential.user.getIdTokenResult();
            if (!isAdmin(claims)) throw new NotAdminError();

            const res = await fetch("/api/login", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error(`session ${res.status}`);

            window.location.replace(afterSignIn());
        } catch (e) {
            if (e instanceof NotAdminError) {
                await signOut(auth).catch(() => {});
                setError("This account doesn’t have admin access.");
            } else {
                setError(friendlyError(e));
            }
            setPending(false);
        }
    }

    return (
        <Box component="main" sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
            <Card sx={{ width: "100%", maxWidth: 400 }}>
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" fontWeight={600}>
                        MovieDB Admin
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
                        Sign in with an admin account.
                    </Typography>
                    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
                        <TextField
                            label="Email"
                            type="email"
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="Password"
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={pending}
                            startIcon={pending ? <CircularProgress size={18} color="inherit" /> : null}
                        >
                            {pending ? "Signing in" : "Sign in"}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
}
