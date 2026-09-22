'use client';

import React, { useEffect, useState } from 'react';
import {optimizedImage} from '@/lib/image';
import Link from 'next/link';
import useSWR from "swr";
import {Movie} from "@/lib/models/Movie";
import {Page} from "@/lib/models/Page";
import {useDominantColor} from "@/app/components/ColorExtract";

const SLIDE_MS = 5000;

const ENDPOINT: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all?sortBy=popularity&limit=5`;

// res.json() alone treats a 404 body as a successful response, so an error
// payload like {"status":404,...} used to flow into onSuccess, where .content
// is undefined.
const fetcher = async (url: string): Promise<Page<Movie>> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }
    return res.json();
};

/** True when the viewer asked the OS to reduce motion. */
function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);

    return reduced;
}

const FALLBACK_OVERLAY = "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.75))";

function Item({item, length, isActive, isNext}: {item: Movie; length: number; isActive: boolean; isNext: boolean}) {
    // Extraction starts for the visible slide and the one after it, so the
    // colour is ready before a slide rotates in. Once known it's cached, so a
    // slide keeps its colour while sliding out and when it comes round again.
    const color = useDominantColor(item.background, isActive || isNext);
    // The optimizer 500s on an upstream slower than 7s; show the original then.
    const [useOriginal, setUseOriginal] = useState(false);

    return (
        <div
            className="relative h-[600px] shrink-0"
            style={{width: `${100 / length}%`}}
            role="group"
            aria-roledescription="slide"
            aria-label={item.title}
            // Inactive slides stay in the DOM for the transform, but should not
            // be reachable by a screen reader or the tab key.
            aria-hidden={!isActive}
            inert={!isActive}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                {...(useOriginal
                    ? {src: item.background}
                    : optimizedImage(item.background, 1920, 1080, "100vw"))}
                onError={() => setUseOriginal(true)}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
            />

            {/* Two layers crossfading, because a gradient background can't
                itself be transitioned. Stacking them would darken the image,
                so the fallback fades out as the colour fades in. */}
            <div
                className={`absolute inset-0 transition-opacity duration-500 ${color ? "opacity-0" : "opacity-100"}`}
                style={{background: FALLBACK_OVERLAY}}
            />
            <div
                className={`absolute inset-0 transition-opacity duration-500 ${color ? "opacity-100" : "opacity-0"}`}
                style={color ? {background: `linear-gradient(to bottom, rgba(${color.r}, ${color.g}, ${color.b}, 0.7), rgba(0, 0, 0, 0.7))`} : undefined}
            />

            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                {/* Frosted glass, matching MoviePreview's info area: starts
                    4rem above the caption and fades in through a mask, so
                    there's no edge where the image ends and the glass begins. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 bg-neutral-950/45 backdrop-blur-2xl backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,transparent,black_4rem)]"
                />

                <div className="relative">
                    <div className="flex flex-row items-center gap-2">
                        <h2 className="text-2xl font-bold">{item.title}</h2>
                        <span className="text-sm text-gray-300">{item.year}</span>
                    </div>
                    <p className="line-clamp-3 text-sm">{item.plot}</p>
                    <Link
                        href={`/movie/${item.id}`}
                        className="mt-2 inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-800"
                    >
                        More Info
                        <span className="sr-only"> about {item.title}</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();

    const {data, isLoading, error} = useSWR<Page<Movie>>(ENDPOINT, fetcher);

    // Derived rather than copied into state: mirroring the response into
    // useState is what allowed items to become undefined.
    const items = data?.content ?? [];
    const count = items.length;

    useEffect(() => {
        // Autoplay must be stoppable (WCAG 2.2.2), and reduced-motion users
        // should not get movement they did not ask for.
        if (count === 0 || paused || reducedMotion) return;

        const interval = setInterval(
            () => setCurrentIndex((i) => (i + 1) % count),
            SLIDE_MS,
        );
        return () => clearInterval(interval);
    }, [count, paused, reducedMotion]);

    // Guard against the index dangling past the end if the response shrinks.
    useEffect(() => {
        if (count > 0 && currentIndex >= count) setCurrentIndex(0);
    }, [count, currentIndex]);

    function onKeyDown(event: React.KeyboardEvent) {
        if (count === 0) return;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            setCurrentIndex((i) => (i + 1) % count);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            setCurrentIndex((i) => (i - 1 + count) % count);
        }
    }

    if (isLoading) {
        return <div className="h-[600px] w-full animate-pulse bg-gray-800" />;
    }

    // A failed fetch should leave a gap, not take the home page down with it.
    if (error || count === 0) {
        return null;
    }

    return (
        <section
            className="relative w-full max-w-full overflow-hidden"
            aria-roledescription="carousel"
            aria-label="Popular movies"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={onKeyDown}
            tabIndex={0}
        >
            <div
                className={`flex ${reducedMotion ? "" : "transition-transform duration-700 ease-in-out"}`}
                style={{
                    width: `${count * 100}%`,
                    transform: `translateX(-${currentIndex * (100 / count)}%)`,
                }}
            >
                {items.map((item, idx) => (
                    <Item
                        key={item.id}
                        item={item}
                        length={count}
                        isActive={idx === currentIndex}
                        isNext={idx === (currentIndex + 1) % count}
                    />
                ))}
            </div>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {items.map((item, index) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Show slide ${index + 1} of ${count}: ${item.title}`}
                        aria-current={index === currentIndex}
                        className={`h-3 w-3 cursor-pointer rounded-full transition-colors ${
                            index === currentIndex ? "bg-white" : "bg-white/40 hover:bg-white/70"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
