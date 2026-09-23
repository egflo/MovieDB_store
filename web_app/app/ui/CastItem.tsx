import React, { useRef, useState, useEffect } from 'react';
import {Cast} from "@/lib/models/Cast";
import {useRouter} from "next/navigation";
import ProfileImage from "@/app/components/ProfileImage";
import {GLASS_CARD} from "@/app/ui/glass";


interface CastItemProps {
    item: Cast
}

export default function CastItem({ item }: CastItemProps) {
    const router = useRouter();
    const cast = item;
    const valid = cast.photo && cast.photo !== "N/A" && cast.photo !== "null" && cast.photo !== "";
    const tokens = cast.name.split(" ");

    return (
        // A small glass card around the photo, so the frosted surface has room
        // to show against the movie's background.
        <div
            onClick={() => router.push(`/cast/${cast.id}`)}
            className={`flex w-36 cursor-pointer flex-col items-center gap-2 rounded-2xl p-3 transition-colors hover:bg-white/[0.12] ${GLASS_CARD}`}>

            <ProfileImage
                name={cast.name}
                imageUrl={cast.photo}
                size={110}
                />

            <div className="flex w-full min-w-0 flex-col items-center gap-0">
                <h1 className="w-full truncate text-center text-sm font-bold text-white" title={cast.name}>{cast.name}</h1>
                <p className="w-full truncate text-center text-sm text-gray-300" title={cast.characters?.join(' / ')}>
                    {cast.characters?.join(' / ')}
                </p>
            </div>
        </div>
    );
}