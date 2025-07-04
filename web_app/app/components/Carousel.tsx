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
                        background: `linear-gradient(to bottom, rgba(${palette.colors[0].r}, ${palette.colors[0].g}, ${palette.colors[0].b}, 0.7), rgba(0, 0, 0, 0.7))`
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
const fetcher = (url: string) => fetch(url).then((res) => res.json());
const Carousel: React.FC<CarouselProps> = ({ url }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [items, setItems] = useState<Movie[]>([]);

    const {data, isLoading, error} = useSWR<Page<Movie>>(ENDPOINT, fetcher, {
        onSuccess: (data) => {
            console.log("SWR Carousel Success", data);
            setItems(data.content);
        },
        onError: (error) => {
            console.error("SWR Carousel Error", error);
        },
    });

    // Auto-slide every 5 seconds
    useEffect(() => {
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
