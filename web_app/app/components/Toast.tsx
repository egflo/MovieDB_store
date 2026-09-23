'use client';

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {createPortal} from "react-dom";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {GLASS_CARD} from "@/app/ui/glass";

interface Toast {
    message: string;
    /** e.g. {label: "Undo", onClick}. Clicking it also dismisses the toast. */
    action?: {label: string; onClick: () => void};
    tone?: "default" | "error";
}

const ToastContext = createContext<((toast: Toast) => void) | undefined>(undefined);

const DURATION_MS = 5000;

/**
 * Brief confirmations at the bottom of the screen ("Removed from favorites ·
 * Undo"). One at a time: a new toast replaces the current one. It closes after
 * five seconds, but not while the pointer is over it, so there's time to reach
 * the action. Announced to screen readers through a polite live region.
 */
export function ToastProvider({children}: { children: React.ReactNode }) {
    const [toast, setToast] = useState<(Toast & {key: number}) | null>(null);
    const [hovered, setHovered] = useState(false);
    const [mounted, setMounted] = useState(false);
    const nextKey = useRef(0);

    useEffect(() => setMounted(true), []);

    const show = useCallback((t: Toast) => setToast({...t, key: nextKey.current++}), []);
    const dismiss = useCallback(() => setToast(null), []);

    // Restarts for each new toast, and pauses while hovered.
    useEffect(() => {
        if (!toast || hovered) return;
        const timer = setTimeout(dismiss, DURATION_MS);
        return () => clearTimeout(timer);
    }, [toast, hovered, dismiss]);

    return (
        <ToastContext.Provider value={show}>
            {children}
            {mounted && createPortal(
                <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
                    {toast && (
                        <div
                            key={toast.key}
                            role={toast.tone === "error" ? "alert" : "status"}
                            onMouseEnter={() => setHovered(true)}
                            onMouseLeave={() => setHovered(false)}
                            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm text-white shadow-2xl motion-safe:animate-[toast-in_200ms_ease-out] ${GLASS_CARD} bg-neutral-900/80 ${
                                toast.tone === "error" ? "ring-red-400/40" : ""
                            }`}
                        >
                            <span className="min-w-0 truncate">{toast.message}</span>
                            {toast.action && (
                                <button
                                    type="button"
                                    onClick={() => { toast.action!.onClick(); dismiss(); }}
                                    className="shrink-0 cursor-pointer rounded-full px-2.5 py-1 font-semibold text-white hover:bg-white/10"
                                >
                                    {toast.action.label}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={dismiss}
                                aria-label="Dismiss"
                                className="shrink-0 cursor-pointer rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                            >
                                <CloseRoundedIcon sx={{fontSize: 18}} />
                            </button>
                        </div>
                    )}
                </div>,
                document.body,
            )}
        </ToastContext.Provider>
    );
}

/** Show a toast: toast({message: "Removed", action: {label: "Undo", onClick}}). */
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}
