'use client';

import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteRounded from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRounded from "@mui/icons-material/FavoriteBorderRounded";
import { useAuth } from "@/lib/firebase/AuthContext";
import { useBookmarks } from "@/lib/context/BookmarkContext";
import {CHIP_ICON_SIZE, CHIP_ICON_SX} from "@/app/ui/chip";
import SignInDialog from "@/app/components/SignInDialog";
import { useToast } from "@/app/components/Toast";

type FavoriteProps = {
    id: string;
    /** Names the movie in the confirmation toast. */
    title?: string;
    /** "small" for overlaying a poster; the default matches the movie page's chips. */
    size?: "default" | "small";
    /** "chip" draws the round translucent background; "plain" is just the
     *  heart, with a shadow so it reads over a poster, filled when saved. */
    appearance?: "chip" | "plain";
    onBookmarkAdded?: (id: string) => void;
    onBookmarkRemoved?: (id: string) => void;
};

export default function Favorite({
    id,
    title,
    size = "default",
    appearance = "chip",
    onBookmarkAdded,
    onBookmarkRemoved,
}: FavoriteProps) {
    const { user } = useAuth();
    const { getByMovie, add, removeByMovie, loading } = useBookmarks();
    const toast = useToast();
    const named = title ? ` “${title}”` : '';
    const failed = () => toast({ message: "Couldn’t update your favorites. Try again.", tone: "error" });

    /** Save, then confirm. Also used by Undo, after this card may have gone. */
    const save = () => add(id)
        .then(() => {
            onBookmarkAdded?.(id);
            toast({ message: `Saved${named} to favorites` });
        })
        .catch((e) => {
            // warn, not error: the toast tells the user, and in dev console.error
            // also opens the Next.js error overlay over the page.
            console.warn("Failed to add bookmark", e);
            failed();
        });
    const [pending, setPending] = useState(false);
    // Signed-out clicks open a sign-in dialog rather than doing nothing, and
    // the favourite is saved once signed in, so the click isn't lost.
    const [signInOpen, setSignInOpen] = useState(false);
    const [saveAfterSignIn, setSaveAfterSignIn] = useState(false);

    const bookmarked = Boolean(getByMovie(id));

    // After sign-in the page refreshes its session; wait for the signed-in user
    // and their bookmarks, then save, unless it was already a favourite.
    useEffect(() => {
        if (!saveAfterSignIn || !user || loading) return;
        setSaveAfterSignIn(false);
        if (bookmarked) return;
        setPending(true);
        save().finally(() => setPending(false));
    }, [saveAfterSignIn, user, loading, bookmarked, add, id, onBookmarkAdded]);

    async function toggle() {
        if (!user) {
            setSignInOpen(true);
            return;
        }
        if (pending) return;
        setPending(true);
        try {
            if (bookmarked) {
                // Previously this only flipped local state, so un-favouriting
                // never reached the server.
                await removeByMovie(id);
                onBookmarkRemoved?.(id);
                // On the Favorites page the card is gone by now, so Undo is the
                // way back.
                toast({ message: `Removed${named} from favorites`, action: { label: "Undo", onClick: () => { save(); } } });
            } else {
                await save();
            }
        } catch (e) {
            console.warn("Failed to update bookmark", e);
            failed();
        } finally {
            setPending(false);
        }
    }

    return (
        // A round chip, styled like the genre chips above it.
        <>
        <IconButton
            disabled={pending}
            onClick={toggle}
            sx={appearance === "plain" ? PLAIN_SX : size === "small" ? SMALL_SX : CHIP_ICON_SX}
            aria-label={bookmarked ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={bookmarked}
        >
            {appearance === "plain" ? (
                bookmarked
                    ? <FavoriteRounded sx={{ fontSize: 22, color: "#ef4444" }} />
                    : <FavoriteBorderRounded sx={{ fontSize: 22 }} />
            ) : (
                <FavoriteBorderOutlined sx={{ ...(size === "small" ? { fontSize: 17 } : CHIP_ICON_SIZE), color: bookmarked ? "red" : "inherit" }} />
            )}
        </IconButton>
        <SignInDialog
            open={signInOpen}
            onClose={() => setSignInOpen(false)}
            onSignedIn={() => setSaveAfterSignIn(true)}
            reason="Sign in to save this movie to your favorites."
        />
        </>
    );
}

/** The chip look at 30px, for the corner of a poster. */
const SMALL_SX = { ...CHIP_ICON_SX, width: 30, height: 30 };

/** Just the heart: no background, a drop shadow for legibility over imagery,
 *  and a small grow on hover in place of the chip's hover fill. */
const PLAIN_SX = {
    width: 30,
    height: 30,
    padding: 0,
    color: "white",
    backgroundColor: "transparent",
    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
    transition: "transform 150ms",
    "&:hover": { backgroundColor: "transparent", transform: "scale(1.15)" },
    "&.Mui-disabled": { color: "rgba(255,255,255,0.5)" },
} as const;
