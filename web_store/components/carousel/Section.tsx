import {useBookmarkContext} from "../../contexts/BookmarkContext";
import React, {useEffect, useRef, useState} from "react";
import Typography from "@mui/material/Typography";
import VerticalCard from "../cards/VerticalCard";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import Button from "@mui/material/Button";
import { TransitionGroup, CSSTransition } from 'react-transition-group';


interface SectionProps {
    title: string;
    path: string;
    authenticated: boolean;
    vertical?: boolean;
}

export const Section: React.FC<SectionProps> = ({ title, path, authenticated, vertical }) => {
    const { bookmarks, loading, error, addBookmark, removeBookmark } = useBookmarkContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hide, setHide] = useState(true);

    useEffect(() => {
        const updateVisibleItems = () => {
            if (window.innerWidth >= 1280) {
                setVisibleItems(6);
            } else if (window.innerWidth >= 1024) {
                setVisibleItems(5);
            } else if (window.innerWidth >= 768) {
                setVisibleItems(3);
            } else {
                setVisibleItems(2);
            }
        };

        updateVisibleItems();
        window.addEventListener('resize', updateVisibleItems);
        return () => window.removeEventListener('resize', updateVisibleItems);
    }, []);

    const handlePrevClick = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex - visibleItems;
            if (newIndex < 0) {
                return bookmarks.length - (bookmarks.length % visibleItems);
            }
            return newIndex;
        });
    };

    const handleNextClick = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + visibleItems;
            if (newIndex >= bookmarks.length) {
                return 0;
            }
            return newIndex;
        });
    };

    const SkeletonVertical = () => {
        return (
            <div className="flex gap-4">
                {Array.from({ length: visibleItems }, (_, index) => (
                    <div key={index} style={{ width: `${100 / visibleItems}%` }}>
                        <div className="skeleton animate-pulse w-full h-96 min-h-96 bg-gray-950 rounded-md " />
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div>
                <div className="flex justify-between items-center px-4 py-1">
                    <Typography component="div" variant="h6" color="white" className="font-extrabold tracking-tight text-white">
                        {title}
                    </Typography>
                </div>
                <SkeletonVertical />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center px-4 py-1">
                <Typography component="div" variant="h6" color="white" className="font-extrabold tracking-tight text-white">
                    {title}
                </Typography>
            </div>

            <div ref={containerRef} className="relative w-full flex flex-col gap-1 px-2 ">
                <div className="relative flex ">
                    <TransitionGroup
                        className="flex gap-4 transition-transform duration-500 ease-in-out"
                        style={{
                            width: '100%',
                            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                            transition: 'transform 0.5s ease-in-out',
                        }}
                    >
                        {bookmarks.map((item, index) => (
                            <CSSTransition key={item.id} timeout={500} classNames="bookmark">
                                <div
                                    style={{ width: `${100 / visibleItems}%` }}
                                    className="flex-shrink-0 relative bookmark-move"
                                    onMouseEnter={() => setHide(true)}
                                    onMouseLeave={() => setHide(false)}
                                >

                                    <VerticalCard movie={item.movie} />
                                </div>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>
                </div>
                <button
                    onClick={handlePrevClick}
                    style={{
                        opacity: hide ? "0" : "1",
                        transition: "opacity 0.5s ease-in-out",
                    }}
                    className="absolute top-1/2 left-5 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-md focus:outline-none"
                >
                    <ChevronLeft fontSize={'large'} />
                </button>
                <button
                    style={{
                        opacity: hide ? "0" : "1",
                        transition: "opacity 0.5s ease-in-out",
                    }}
                    onClick={handleNextClick}
                    className="absolute top-1/2 right-5 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-md focus:outline-none"
                >
                    <ChevronRight fontSize={'large'} />
                </button>
            </div>
        </div>
    );
};