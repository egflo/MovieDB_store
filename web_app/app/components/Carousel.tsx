import React, { useState, useEffect } from 'react';
import useSWR from "swr";
import {Movie} from "@/lib/models/Movie";
import {Page} from "@/lib/models/Page";
import {usePalette} from "@/app/components/ColorExtract";

interface CarouselProps {
    url: string;
}


function Item({idx, length, item}: {idx: number, length: number, item: Movie}) {
    const { palette, error } = usePalette(item.background);

    return (
        <div
            key={item.id}
            className="relative w-full h-[600px] object-cover flex-shrink-0"
            style={{ width: `${100 / length}%` }}
        >
            <img
                src={item.background}
                alt={`Slide ${idx}`}
                className="w-full h-full object-cover"
            />

            {palette && (
                <div
                    className="absolute inset-0"
                    style={{
                        background: (() => {
                            // auto-palette exposes swatches via findSwatches(), not a `colors` array.
                            const [swatch] = palette.findSwatches(1);
                            if (!swatch) return "rgba(0, 0, 0, 0.7)";
                            const { r, g, b } = swatch.color.toRGB();
                            return `linear-gradient(to bottom, rgba(${r}, ${g}, ${b}, 0.7), rgba(0, 0, 0, 0.7))`;
                        })()
                    }}
                />
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 rounded-t-2xl text-white bg-gray-900/70 shadow-lg ring-1 ring-black/5 overflow-hidden">
                <div className="flex flex-row gap-2 items-center">
                    <h2 className="text-2xl font-bold">{item.title}</h2>
                    <span className="text-sm text-gray-300">{item.year}</span>
                </div>
                <p className="text-sm">{item.plot}</p>
                <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-800 transition-colors cursor-pointer">
                    More Info
                </button>
            </div>
        </div>
    );
}



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

const Carousel: React.FC<CarouselProps> = ({ url }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const {data, isLoading, error} = useSWR<Page<Movie>>(ENDPOINT, fetcher);

    // Derived rather than copied into state: mirroring the response into
    // useState is what allowed items to become undefined.
    const items = data?.content ?? [];

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (items.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex === items.length - 1 ? 0 : prevIndex + 1
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [items.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (isLoading) {
        return <div className="w-full h-[600px] animate-pulse bg-gray-800" />;
    }

    // A failed fetch should leave a gap, not take the home page down with it.
    if (error || items.length === 0) {
        return null;
    }

    return (
        <div className="relative w-full max-w-full overflow-hidden">
            <div className="flex transition-transform duration-700 ease-in-out"
                 style={{
                     width: `${items.length * 100}%`,
                     transform: `translateX(-${currentIndex * (100 / items.length)}%)`
                 }}
            >
                {items.map((item, idx) => (
                    <Item key={item.id} idx={idx} length={items.length} item={item} />
                ))}
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {items.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-3 h-3 rounded-full cursor-pointer ${
                            index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
