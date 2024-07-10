import React, {useCallback, useEffect, useRef, useState} from 'react';
import {axiosInstance} from "../utils/firebase";
import {Movie} from "../models/Movie";
import {CircularProgress} from "@mui/material";
const API_URL_VOTES: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/all?sortBy=ratings.numOfVotes&limit=26`;
import { extractColors } from 'extract-colors'

// @ts-ignore
const MoviePoster = ({ src }) => {
    const imgRef = useRef(null);
    const [gradientColor, setGradientColor] = useState('rgba(0,0,0,0.7)');

    useEffect(() => {
        const imgElement = imgRef.current;
        // @ts-ignore
        if (imgElement.complete) {
            extractColor();
        } else {
            // @ts-ignore
            imgElement.addEventListener('load', extractColor);
        }

        function extractColor() {
            // @ts-ignore
            extractColors(src, { crossOrigin: 'Anonymous' }).then(colors => {
                if (colors && colors[0]) {
                    const { red, green, blue } = colors[0];
                    setGradientColor(`rgba(${red}, ${green}, ${blue}, 0.7)`);
                }
            }).catch(err => console.error(err));
        }
    }, [src]);

    return (
        <div className="relative w-72 h-96">
            <img
                ref={imgRef}
                src={src}
                alt="Movie Poster"
                className="w-full h-full object-cover"
            />
            <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `linear-gradient(to bottom, rgba(0, 0, 0, 0), ${gradientColor})` }}
            ></div>
        </div>
    );
};

function HorizontalScroll() {
    const [items, setItems] = useState<Movie[]>([]);
    const carouselRef = useRef<HTMLDivElement>(null);
    const itemRef = useRef<HTMLDivElement>(null);
    const [visibleItems, setVisibleItems] = useState(6); // Default number of visible items
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const totalItems = items.length;
    const extendedItems = [...items, ...items]; // Duplicate the list for seamless scrolling

    const updateVisibleItems = useCallback(() => {

        axiosInstance.get(API_URL_VOTES).then(res => {
            setItems(res.data.content);
        }).catch(err => {
            console.error(err);
        });

        if (carouselRef.current && itemRef.current) {
            const containerWidth = carouselRef.current.clientWidth;
            const itemWidth = itemRef.current.clientWidth;
            const newVisibleItems = Math.floor(containerWidth / itemWidth);
            setVisibleItems(newVisibleItems);
        }
    }, []);

    useEffect(() => {
        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);
        return () => window.removeEventListener('resize', updateVisibleItems);
    }, [updateVisibleItems]);

    const handleScroll = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
            const maxScrollLeft = scrollWidth - clientWidth;

            if (scrollLeft >= maxScrollLeft) {
                // Jump back to the beginning (seamlessly)
                carouselRef.current.scrollLeft = scrollLeft - maxScrollLeft;
            } else if (scrollLeft <= 0) {
                // Jump to the end (seamlessly)
                carouselRef.current.scrollLeft = maxScrollLeft + scrollLeft;
            }
        }
    };

    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (carouselRef.current) {
                carouselRef.current.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const handleNext = () => {
        if (carouselRef.current) {
            const newIndex = carouselRef.current.scrollLeft + carouselRef.current.clientWidth;
            carouselRef.current.scrollTo({
                left: newIndex,
                behavior: 'smooth',
            });
        }
    };

    const handlePrev = () => {
        if (carouselRef.current) {
            const newIndex = carouselRef.current.scrollLeft - carouselRef.current.clientWidth;
            carouselRef.current.scrollTo({
                left: newIndex,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="relative w-full">
            <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 z-10"
            >
                &lt;
            </button>
            <div className="overflow-hidden" ref={carouselRef}>
                <div className="flex transition-transform duration-500">
                    {extendedItems.map((item, index) => (
                        <div
                            key={index}
                            ref={index < totalItems ? itemRef : null} // Set ref to item to calculate width
                            className={`flex-shrink-0 w-48 p-2 transition-transform duration-300 ${
                                hoveredIndex === index % totalItems ? 'scale-110' : ''
                            }`}
                            onMouseEnter={() => setHoveredIndex(index % totalItems)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="relative w-full h-64">
                                <img
                                    src={item.poster}
                                    alt={item.title}
                                    className="object-cover w-full h-full rounded-lg"
                                />
                                {hoveredIndex === index % totalItems && (
                                    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white p-4 transition-opacity duration-300">
                                        <h3 className="text-lg font-bold">{item.title}</h3>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 z-10"
            >
                &gt;
            </button>
        </div>
    );
}

export default HorizontalScroll;