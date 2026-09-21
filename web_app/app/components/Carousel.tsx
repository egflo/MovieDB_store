'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useSWR from "swr";
import {Movie} from "@/lib/models/Movie";
import {Page} from "@/lib/models/Page";
import {usePalette} from "@/app/components/ColorExtract";

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

function Item({item, length, isActive}: {item: Movie; length: number; isActive: boolean}) {
    // Only the visible slide extracts a palette. Running this for every slide
    // pulled all five backgrounds through the image proxy and decoded them on
    // mount, for a gradient four of them were not showing.
    const {palette} = usePalette(isActive ? item.background : "");

    const overlay = (() => {
        if (!palette) return "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.75))";
        // auto-palette exposes swatches via findSwatches(), not a `colors` array.
        const [swatch] = palette.findSwatches(1);
        if (!swatch) return "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.75))";
        const {r, g, b} = swatch.color.toRGB();
        return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.7), rgba(0, 0, 0, 0.7))`;
    })();

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
                src={item.background}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover"
            />

            <div className="absolute inset-0" style={{background: overlay}} />

            <div className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-2xl bg-gray-900/70 p-4 text-white shadow-lg ring-1 ring-black/5">
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
                            index === currentIndex ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-100"
                        }`}
                    />
                ))}
            </div>
        </section>
    );
}
