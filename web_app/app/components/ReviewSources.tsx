"use client";

import React, {useState} from "react";
import InfiniteScrollableContainer from "@/app/components/InfiniteScrollableContainer";

export interface ReviewSource {
    key: string;
    label: string;
    /** The site's logo (a file in /public), shown before the label. */
    icon?: string;
    /** How many reviews the movie has from it; sources with none are left out. */
    count: number;
    /** The paged endpoint for this movie and source. */
    url: string;
}

interface ReviewSourcesProps<T> {
    title: string;
    sources: ReviewSource[];
    ItemComponent: React.ComponentType<{ item: T }>;
    /** Tailwind height class of ItemComponent's card, for the loading placeholder. */
    cardHeight: string;
}

/**
 * A review row whose reviews come from several sites, one site at a time:
 * a pill per site that has reviews for this movie (with its count), and the
 * usual scrolling row for the selected one. Nothing at all when no site has
 * any. The sites stay separate lists rather than one merged list: the same
 * review is often on two of them, and they share no complete sort order.
 */
export default function ReviewSources<T>({title, sources, ItemComponent, cardHeight}: ReviewSourcesProps<T>) {
    const available = sources.filter((source) => source.count > 0);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);
    if (available.length === 0) return null;
    const selected = available.find((source) => source.key === selectedKey) ?? available[0];

    return (
        <section aria-label={title} className="flex w-full flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-lg font-bold text-gray-300">{title}</p>
                <div role="group" aria-label={`${title} source`} className="flex flex-wrap gap-2">
                    {available.map((source) => {
                        const active = source.key === selected.key;
                        return (
                            <button
                                key={source.key}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setSelectedKey(source.key)}
                                className={
                                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors " +
                                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 " +
                                    (active
                                        ? "bg-white text-black ring-white"
                                        : "text-gray-200 ring-white/15 hover:bg-white/10 hover:text-white hover:ring-white/30")
                                }
                            >
                                {source.icon &&
                                    // Decorative: the label beside it names the site.
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={source.icon} alt="" aria-hidden className="h-3.5 w-auto shrink-0 object-contain" />
                                }
                                {source.label}
                                <span className={active ? "text-black/55" : "text-white/45"}>
                                    {source.count.toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Keyed by source so the row starts again at its left edge. */}
            <InfiniteScrollableContainer
                key={selected.key}
                url={selected.url}
                ItemComponent={ItemComponent}
                placeholder={
                    <div role="status" aria-label={`Loading ${selected.label} reviews`} className="flex gap-4 overflow-hidden motion-safe:animate-pulse">
                        {Array.from({length: 4}, (_, i) => (
                            <div key={i} className={`w-[320px] shrink-0 rounded-2xl bg-white/5 ${cardHeight}`} />
                        ))}
                    </div>
                }
            />
        </section>
    );
}
