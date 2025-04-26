import React, { useRef, useState, useEffect } from 'react';
import {Cast} from "@/app/models/Cast";
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
            className="flex flex-col items-center gap-4 cursor-pointer">

            <ProfileImage
                name={cast.name}
                imageUrl={cast.photo}
                size={140}
                />

            <div className="flex flex-col items-center gap-1">
                <h1 className="text-md font-bold text-white truncate">{cast.name}</h1>
                <div className="text-sm font-bold text-gray-400">
                    {cast.characters.join(", ")}
                </div>
            </div>
        </div>
    );
}