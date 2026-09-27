"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import LocalMoviesOutlinedIcon from "@mui/icons-material/LocalMoviesOutlined";
import { fallbackImage, optimizedImage } from "@/lib/image";

/** Posters are 2:3. */
const RATIO = 1.5;

function isUrl(value: string | null | undefined): value is string {
    return !!value && /^https?:\/\//.test(value);
}

/**
 * A resized poster with the same fallbacks as web_app: the optimizer's URL,
 * then fanart.tv's small preview (or the original), then a placeholder.
 * Many posters in the data are missing, "N/A" or dead links.
 */
export default function Poster({ src, title, width }: { src?: string | null; title: string; width: number }) {
    const height = Math.round(width * RATIO);
    const [attempt, setAttempt] = useState(0);

    const placeholder = (
        <Box
            role="img"
            aria-label={`No poster for ${title}`}
            sx={{
                width, height, flexShrink: 0, borderRadius: 1,
                display: "grid", placeItems: "center",
                bgcolor: "action.hover", color: "text.disabled",
            }}
        >
            <LocalMoviesOutlinedIcon fontSize={width > 80 ? "large" : "small"} />
        </Box>
    );

    if (!isUrl(src) || attempt > 1) return placeholder;

    const image = attempt === 0 ? optimizedImage(src, width, height) : { src: fallbackImage(src) };

    return (
        <Box
            component="img"
            {...image}
            alt=""
            width={width}
            height={height}
            loading="lazy"
            onError={() => setAttempt((n) => n + 1)}
            sx={{ width, height, flexShrink: 0, objectFit: "cover", borderRadius: 1, bgcolor: "action.hover" }}
        />
    );
}
