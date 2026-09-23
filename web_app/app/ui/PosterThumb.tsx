'use client';

import React, { useState } from "react";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import { fallbackImage, optimizedImage } from "@/lib/image";

const isImageUrl = (value?: string) => !!value && /^https?:\/\//.test(value);

/**
 * A small poster for a cart or order line, sized by `className` (e.g. "h-16 w-11").
 * Like PosterItem: the resized image, then fanart's small preview, then a
 * quiet placeholder. Originals are 0.8–1.5 MB, far too much for a thumbnail.
 */
export default function PosterThumb({ url, width, height, className = "" }: {
    url?: string; width: number; height: number; className?: string;
}) {
    const [failures, setFailures] = useState(0);
    const box = `shrink-0 overflow-hidden rounded-md ring-1 ring-inset ring-white/10 ${className}`;

    if (!isImageUrl(url) || failures >= 2) {
        return (
            <span aria-hidden className={`flex items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-900 ${box}`}>
                <LocalMoviesIcon sx={{ fontSize: 16 }} className="text-white/25" />
            </span>
        );
    }
    const image = failures === 0 ? optimizedImage(url!, width, height) : { src: fallbackImage(url!) };
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img {...image} alt="" decoding="async" onError={() => setFailures((n) => n + 1)}
             className={`object-cover ${box}`} />
    );
}
