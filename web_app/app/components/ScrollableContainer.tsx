"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation';
import React, { useState, useRef, useEffect } from "react";
import { debounce } from "lodash";


interface ScrollableContainerProps<T> {
    data: T[];
    ItemComponent: React.ComponentType<{ item: T }>;
}

export default function ScrollableContainer<T>({data, ItemComponent,}: ScrollableContainerProps<T>) {
    const router = useRouter();
    const [items, setItems] = useState<T[]>(data);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hovered, setHovered] = useState(false);

    const checkForScrollPosition = () => {
        const container = containerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
        }
    };

    const debouncedCheckForScrollPosition = debounce(checkForScrollPosition, 100);

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
            checkForScrollPosition();
            container.addEventListener('scroll', debouncedCheckForScrollPosition);
        }

        return () => {
            if (container) {
                container.removeEventListener('scroll', debouncedCheckForScrollPosition);
            }
        };
    }, []);

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="relative w-full">
            {canScrollLeft && (
                <Image
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-10"
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
                className="flex flew-row overflow-x-auto gap-4 whitespace-nowrap scroll-smooth no-scrollbar" >
                {items.map((item: T, index: number) => (
                    <div key={index} className="flex">
                        <ItemComponent item={item} />
                    </div>
                ))}
            </div>

            {canScrollRight && (
                <Image
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer z-10"
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

    );
}