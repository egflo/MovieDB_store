import React, { useRef, useState, useEffect } from 'react';
import {Cast} from "@/lib/models/Cast";
import {useRouter} from "next/navigation";
import ProfileImage from "@/app/components/ProfileImage";


interface CastItemProps {
    item: Cast
}

export default function CastItem({ item }: CastItemProps) {
    const router = useRouter();
    const cast = item;
    const valid = cast.photo && cast.photo !== "N/A" && cast.photo !== "null" && cast.photo !== "";
    const tokens = cast.name.split(" ");

    return (
        <div
            onClick={() => router.push(`/cast/${cast.id}`)}
            className="flex flex-col items-center gap-2 cursor-pointer   shadow-lg max-w-36">

            <ProfileImage
                name={cast.name}
                imageUrl={cast.photo}
                size={125}
                />

            <div className="flex flex-col items-center gap-0">
                <h1 className="text-sm font-bold text-white truncate">{cast.name}</h1>
                    <p className="overflow-hidden text-ellipsis text-gray-400 text-sm"
                    >
                        {cast.characters}
                    </p>
            </div>
        </div>
    );
}