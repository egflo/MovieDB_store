'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import useSWR from "swr";
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {optimizedImage} from '@/lib/image';
import {Movie} from "@/lib/models/Movie";
import {Page} from "@/lib/models/Page";
import {useDominantColor} from "@/app/components/ColorExtract";
import Favorite from "@/app/components/actions/Favorite";
import DetailsLine from "@/app/ui/DetailsLine";
import {PRIMARY_PILL} from "@/app/ui/chip";

const SLIDE_MS = 5000;

const ENDPOINT: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all?sortBy=popularity&limit=5`;

/**
 * About 70% of the screen, within 420-720px: the old fixed 600px filled a
 * phone and was a strip on a large monitor.
 */
const HEIGHT = "h-[clamp(420px,72vh,720px)]";

/** The navbar's side padding, so the caption lines up with the wordmark. */
const GUTTER = "px-4 sm:px-6";

/** A round glass arrow, like the site's chips. */
const ARROW =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full " +
    "bg-black/40 text-white ring-1 ring-inset ring-white/15 backdrop-blur-md transition-[opacity,background-color] " +
    "hover:bg-[rgba(100,100,100,0.4)] focus-visible:opacity-100 pointer-fine:flex opacity-0 group-hover/hero:opacity-100";

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

/** The movie's logo when it has one that loads, else its title as text. */
function TitleArt({item}: {item: Movie}) {
    const [logoFailed, setLogoFailed] = useState(false);
    const logo = !logoFailed && typeof item.logo === "string" && /^https?:\/\//.test(item.logo) ? item.logo : null;
    return (
        <h2 className="flex">
            {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    {...optimizedImage(logo, 400, 150)}
                    alt={item.title}
                    onError={() => setLogoFailed(true)}
                    className="h-auto max-h-20 w-auto max-w-[min(75%,360px)] object-contain object-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] sm:max-h-28"
                />
            ) : (
                <span className="text-3xl font-bold tracking-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.5)] sm:text-5xl">{item.title}</span>
            )}
        </h2>
    );
}

function Item({item, length, isActive, isNext}: {item: Movie; length: number; isActive: boolean; isNext: boolean}) {
    // Extraction starts for the visible slide and the one after it, so the
    // colour is ready before a slide rotates in. Once known it's cached, so a
    // slide keeps its colour while sliding out and when it comes round again.
    const color = useDominantColor(item.background, isActive || isNext);
    // The optimizer 500s on an upstream slower than 7s; show the original then.
    const [useOriginal, setUseOriginal] = useState(false);
    const tint = color ? `${color.r}, ${color.g}, ${color.b}` : null;

    return (
        <div
            className="relative h-full shrink-0"
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
                className="h-full w-full object-cover object-top"
            />

            {/* Shade only where it's needed: the top, behind the clear nav,
                and the bottom left, behind the caption. The whole-image tint
                washed every slide out to the same grey-blue. The extracted
                colour tints the bottom, crossfading in over a neutral one
                (a gradient can't itself be transitioned). */}
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),transparent_22%)]" />
            <div aria-hidden className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.6),rgba(0,0,0,0.2)_45%,transparent_70%)]" />
            <div
                aria-hidden
                className={`absolute inset-0 transition-opacity duration-500 ${tint ? "opacity-0" : "opacity-100"}`}
                style={{background: "linear-gradient(to top, rgba(10,10,10,0.9), rgba(10,10,10,0.35) 40%, transparent 70%)"}}
            />
            <div
                aria-hidden
                className={`absolute inset-0 transition-opacity duration-500 ${tint ? "opacity-100" : "opacity-0"}`}
                style={tint ? {background: `linear-gradient(to top, rgba(${tint}, 0.75), rgba(${tint}, 0.3) 40%, transparent 70%)`} : undefined}
            />

            <div className={`absolute inset-x-0 bottom-0 pb-6 pt-10 text-white ${GUTTER}`}>
                {/* Frosted glass, matching MoviePreview's info area: starts
                    4rem above the caption and fades in through a mask, so
                    there's no edge where the image ends and the glass begins. */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 bg-neutral-950/35 backdrop-blur-2xl backdrop-saturate-150 [mask-image:linear-gradient(to_bottom,transparent,black_4rem)]"
                />

                <div className="relative flex max-w-xl flex-col items-start gap-3">
                    <TitleArt item={item} />
                    <DetailsLine movie={item} genres />
                    {item.plot && <p className="line-clamp-2 text-sm text-white/80 sm:line-clamp-3 sm:text-base">{item.plot}</p>}
                    {/* Room on the right for the slide bars, which sit on this row. */}
                    <div className="flex items-center gap-2 pr-28">
                        <Link
                            href={`/movie/${item.id}`}
                            className={PRIMARY_PILL}
                        >
                            More info<span className="sr-only"> about {item.title}</span>
                        </Link>
                        <Favorite id={item.id} title={item.title} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeroSkeleton() {
    const bar = "animate-pulse rounded bg-white/10";
    return (
        <div aria-busy="true" aria-label="Loading featured movies" className={`relative w-full bg-white/[0.03] ${HEIGHT}`}>
            <div className={`absolute inset-x-0 bottom-0 flex flex-col gap-3 pb-6 ${GUTTER}`}>
                <span className={`h-12 w-64 ${bar}`} />
                <span className={`h-4 w-48 ${bar}`} />
                <span className={`h-4 w-full max-w-xl ${bar}`} />
                <span className="h-10 w-32 animate-pulse rounded-full bg-white/10" />
            </div>
        </div>
    );
}

export default function Carousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const touchStart = useRef<{x: number; y: number} | null>(null);

    const {data, isLoading, error} = useSWR<Page<Movie>>(ENDPOINT, fetcher);

    // Derived rather than copied into state: mirroring the response into
    // useState is what allowed items to become undefined.
    const items = data?.content ?? [];
    const count = items.length;

    // Guard against the index dangling past the end if the response shrinks.
    useEffect(() => {
        if (count > 0 && currentIndex >= count) setCurrentIndex(0);
    }, [count, currentIndex]);

    const step = (by: 1 | -1) => setCurrentIndex((i) => (i + by + count) % count);

    function onKeyDown(event: React.KeyboardEvent) {
        if (count === 0) return;
        if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
        }
    }

    // A horizontal swipe changes slide on touch screens, which get no arrows.
    function onTouchEnd(event: React.TouchEvent) {
        const start = touchStart.current;
        touchStart.current = null;
        const touch = event.changedTouches[0];
        if (!start || !touch) return;
        const dx = touch.clientX - start.x;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) step(dx < 0 ? 1 : -1);
    }

    if (isLoading) return <HeroSkeleton />;

    // A failed fetch should leave a gap, not take the home page down with it.
    if (error || count === 0) {
        return null;
    }

    return (
        <section
            className={`group/hero relative w-full max-w-full overflow-hidden ${HEIGHT}`}
            aria-roledescription="carousel"
            aria-label="Popular movies"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            onKeyDown={onKeyDown}
            onTouchStart={(e) => { touchStart.current = {x: e.touches[0].clientX, y: e.touches[0].clientY}; }}
            onTouchEnd={onTouchEnd}
            tabIndex={0}
        >
            <div
                className={`flex h-full ${reducedMotion ? "" : "transition-transform duration-700 ease-in-out"}`}
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

            <button type="button" onClick={() => step(-1)} aria-label="Previous movie" className={`${ARROW} left-4 sm:left-6`}>
                <ChevronLeftRoundedIcon />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next movie" className={`${ARROW} right-4 sm:right-6`}>
                <ChevronRightRoundedIcon />
            </button>

            {/* One bar per slide, on the same row as the caption's buttons.
                The lit bar fills over the slide's time and moves the carousel
                on when it ends, so hovering or focusing (which pauses the
                animation) holds the slide, and you can see that it has.
                Autoplay must be stoppable (WCAG 2.2.2); with reduced motion
                there's none, and the bar is simply lit. */}
            <div className={`absolute bottom-6 right-0 flex h-10 items-center gap-1 ${GUTTER}`}>
                {items.map((item, index) => {
                    const active = index === currentIndex;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setCurrentIndex(index)}
                            aria-label={`Show slide ${index + 1} of ${count}: ${item.title}`}
                            aria-current={active}
                            className="group/bar flex h-10 cursor-pointer items-center px-0.5"
                        >
                            <span className={`block h-[3px] overflow-hidden rounded-full bg-white/30 transition-[width,background-color] duration-300 group-hover/bar:bg-white/60 ${active ? "w-8" : "w-4"}`}>
                                {active && (
                                    <span
                                        // Keyed by slide, so each one starts from empty.
                                        key={currentIndex}
                                        className="block h-full origin-left rounded-full bg-white"
                                        style={reducedMotion ? undefined : {
                                            animation: `hero-progress ${SLIDE_MS}ms linear forwards`,
                                            animationPlayState: paused ? "paused" : "running",
                                        }}
                                        onAnimationEnd={(e) => { if (e.animationName === "hero-progress") step(1); }}
                                    />
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
