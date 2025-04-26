"use client";

import React, { useState, useRef, useEffect } from "react";
import { debounce } from "lodash";
import useSWRInfinite, {SWRInfiniteKeyLoader} from "swr/infinite";
import {Page} from "@/app/models/Page";
import Image from "next/image";

interface InfiniteScrollableContainerProps<T> {
    url: string;
    ItemComponent: React.ComponentType<{ item: T }>;
}
// A function to get the SWR key of each page,
// its return value will be accepted by `fetcher`.
// If `null` is returned, the request of that page won't start.
const getKey: (index: number, previousPageData: Page<any>, url: string) => (null | string) = (index: number, previousPageData: Page<any>, url: string) => {
    // End of pages
    if (previousPageData && !previousPageData.content) return null;
    return `${url}?page=${index}&limit=10`;
};

const fetcher = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    return data.content;
};

export default function InfiniteScrollableContainer<T>({ url, ItemComponent }: InfiniteScrollableContainerProps<T>) {
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    const {data, error, size, setSize, isValidating} = useSWRInfinite((index, previousPageData) => getKey(index, previousPageData, url), fetcher, {
        errorRetryCount: 3,
        errorRetryInterval: 1000,
        onSuccess: (data) => {
            console.log("SWR Infinite Success", data);
        },
        onError: (error) => {
            console.log("SWR Infinite Error", error);
        },
    });

    const items = data ? [].concat(...data) : [];
    const isLoadingInitialData = !data && !error;

    const checkScrollPosition = () => {
        const container = containerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
        }
    };

    const debouncedCheckForScrollPosition = debounce(checkScrollPosition, 100);

    const scroll = (direction: 'left' | 'right') => {
        const container = containerRef.current;
        if (container) {
            const scrollAmount = container.clientWidth * 0.8;
            const newScrollPosition =
                direction === 'left'
                    ? container.scrollLeft - scrollAmount
                    : container.scrollLeft + scrollAmount;

            container.scrollTo({
                left: newScrollPosition,
                behavior: 'smooth',
            });
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', checkScrollPosition);
            checkScrollPosition();
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, [items]);

    // Load more data when scrolling near the end
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (
                container.scrollLeft + container.clientWidth >= container.scrollWidth - 100 &&
                !isValidating
            ) {
                setSize(size + 1);
            }
        };

        container.addEventListener('scroll', handleScroll);
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [size, setSize, isValidating]);

    if (error) return <div>Error loading items.</div>;

    console.log(items.length)
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative w-full">
            {canScrollLeft && (
                <Image
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-10 m-2"
                    src="/chevron.left.svg"
                    alt="Scroll Left"
                    width={40}
                    height={40}
                    onClick={() => scroll('left')}
                    style={
                        {
                            opacity: hovered ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out',
                        }
                    }
                />
            )}

            <div
                ref={containerRef}
                className="flex flew-col overflow-x-auto gap-4 whitespace-nowrap scroll-smooth no-scrollbar" >
                {items.map((item: T, index: number) => (
                    <div key={index} className="flex">
                        <ItemComponent item={item} />
                    </div>
                ))}
            </div>

            {canScrollRight && (
                <Image
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-10 m-2"
                    src="/chevron.right.svg"
                    alt="Scroll Right"
                    width={40}
                    height={40}
                    onClick={() => scroll('right')}
                    style={
                        {
                            opacity: hovered ? 1 : 0,
                            transition: 'opacity 0.3s ease-in-out',
                        }
                    }
                />
            )}

        </div>

    )
}