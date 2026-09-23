'use client';

import React, {FormEvent, useEffect, useId, useRef, useState} from "react";
import {createPortal} from "react-dom";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {getAuth, signInWithEmailAndPassword} from "firebase/auth";
import {app} from "@/lib/firebase/firebase";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {GLASS_CARD} from "@/app/ui/glass";

/** Firebase's error codes, in words a person can act on. */
function friendlyError(error: unknown): string {
    const code = (error as { code?: string })?.code ?? '';
    if (/invalid-credential|wrong-password|user-not-found|invalid-email/.test(code)) return 'That email and password don’t match an account.';
    if (code.includes('too-many-requests')) return 'Too many attempts. Wait a moment and try again.';
    if (code.includes('network-request-failed')) return 'Couldn’t reach the sign-in service. Check your connection.';
    return 'Couldn’t sign you in. Please try again.';
}

interface SignInDialogProps {
    open: boolean;
    onClose: () => void;
    /** Called once signed in and the page's session has refreshed. */
    onSignedIn?: () => void;
    /** Why sign-in is needed, e.g. "Sign in to save favorites." */
    reason?: string;
}

/**
 * Sign in without leaving the page: the same steps as /login (Firebase, then
 * /api/login to set the session cookie), but it refreshes the current route's
 * server data instead of navigating, so the page, scroll and filters stay put.
 *
 * Portalled to <body>: callers can sit inside a transformed element (a poster
 * card's hover scale), which would otherwise trap a fixed overlay inside it.
 */
export default function SignInDialog({open, onClose, onSignedIn, reason}: SignInDialogProps) {
    const router = useRouter();
    const titleId = useId();
    const emailRef = useRef<HTMLInputElement>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!open) return;
        setError('');
        const previous = document.activeElement as HTMLElement | null;
        emailRef.current?.focus();
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('keydown', onKey);
            previous?.focus?.();
        };
    }, [open, onClose]);

    if (!open) return null;

    async function submit(e: FormEvent) {
        e.preventDefault();
        if (busy) return;
        setBusy(true);
        setError('');
        try {
            const credential = await signInWithEmailAndPassword(getAuth(app), email, password);
            const idToken = await credential.user.getIdToken();
            const res = await fetch('/api/login', {headers: {Authorization: `Bearer ${idToken}`}});
            if (!res.ok) throw new Error(`session ${res.status}`);
            // Re-render the layout with the new session, which updates the
            // signed-in user everywhere, without leaving the page.
            router.refresh();
            setPassword('');
            onSignedIn?.();
            onClose();
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setBusy(false);
        }
    }

    const field = "h-10 w-full rounded-lg bg-white/10 px-3 text-sm text-white outline-none ring-1 ring-inset ring-white/15 placeholder:text-white/40 focus:ring-white/40";

    return createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
            <div role="dialog" aria-modal="true" aria-labelledby={titleId}
                 className={`relative w-full max-w-sm rounded-2xl p-6 text-white ${GLASS_CARD} bg-neutral-900/70`}>
                <button type="button" onClick={onClose} aria-label="Close"
                        className="absolute right-3 top-3 cursor-pointer rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white">
                    <CloseRoundedIcon fontSize="small" />
                </button>

                <h2 id={titleId} className="text-xl font-semibold tracking-tight">Sign in</h2>
                {reason && <p className="mt-1 text-sm text-white/60">{reason}</p>}

                <form onSubmit={submit} className="mt-5 flex flex-col gap-3">
                    <label className="flex flex-col gap-1.5 text-sm text-white/70">
                        Email
                        <input ref={emailRef} type="email" autoComplete="email" required value={email}
                               onChange={(e) => setEmail(e.target.value)} className={field} placeholder="name@email.com" />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm text-white/70">
                        Password
                        <input type="password" autoComplete="current-password" required value={password}
                               onChange={(e) => setPassword(e.target.value)} className={field} />
                    </label>

                    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}

                    <button type="submit" disabled={busy}
                            className="mt-2 h-10 cursor-pointer rounded-full bg-white text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-60">
                        {busy ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-white/60">
                    New here?{' '}
                    <Link href="/register" className="font-medium text-white underline-offset-4 hover:underline">Create an account</Link>
                </p>
            </div>
        </div>,
        document.body,
    );
}
