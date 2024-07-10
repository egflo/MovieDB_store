import React, {useEffect, useRef, useState} from 'react';
import 'tailwindcss/tailwind.css';
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import useInfiniteScroll from "../../hooks/useInfiniteScroll";
import VerticalCard from "../cards/VerticalCard";
import {DetailedCard} from "../cards/DetailedCard";


interface CarouselProps {
    title: string;
    path: string;
    authenticated: boolean;
    vertical?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ title,path,authenticated, vertical }) => {
    const { data, error, isAuth, isLoadingInitialData,  isLoadingMore, isReachingEnd, setSize } =
        useInfiniteScroll(path, authenticated);



    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    //hide buttons if hovered on poster
    const [hide, setHide] = useState(true)
    const [itemWidth, setItemWidth] = useState( 320);

    useEffect(() => {
        const updateVisibleItems = () => {
            if (window.innerWidth >= 1280) {
                setVisibleItems(5);
            } else if (window.innerWidth >= 1280) {
                setVisibleItems(5)
            } else if (window.innerWidth >= 1024) {
                setVisibleItems(4);
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

    const handlePrevClickT = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex - visibleItems;
            return newIndex < 0 ? data.length - visibleItems : newIndex;
        });
    };

    const handleNextClickT = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + visibleItems;
            return newIndex >= data.length ? 0 : newIndex;
        });
    };

    const handlePrevClick = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex - visibleItems;
            if (newIndex < 0) {
                // Wrap around to the end
                return data.length - (data.length % visibleItems);
            }
            return newIndex;
        });
    };

    const handleNextClick = () => {
        setCurrentIndex((prevIndex) => {
            const newIndex = prevIndex + visibleItems;
            if (newIndex >= data.length) {
                // Wrap around to the beginning
                return 0;
            }
            return newIndex;
        });
    };

    const getIndicators = () => {
        const sections = Math.ceil(data.length / visibleItems);
        return Array.from({ length: sections }, (_, index) => (
            <div
                key={index}
                className={`w-4 h-1.5 border rounded-sm  mx-1 ${index === Math.floor(currentIndex / visibleItems) ? 'bg-white' : 'bg-transparent'}`}
                style={{ borderColor: index === Math.floor(currentIndex / visibleItems) ? 'white' : 'gray' }}
            />
        ));
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
    }

    const SkeletonHorizontal = () => {

        return (
            <div className="flex gap-4">
                {Array.from({ length: visibleItems }, (_, index) => (
                    <div key={index} style={{ width: `${100 / visibleItems}%` }}>
                        <div className="skeleton animate-pulse w-full h-48 min-h-48 bg-gray-950 rounded-md " />
                    </div>
                ))}
            </div>
        );
    }

    if (isLoadingInitialData || isAuth) {
        return (
            <div>
                <div className="flex justify-between items-center px-4 py-1">
                    <Typography component="div" variant="h6" color="white"
                                className="font-extrabold tracking-tight text-white">
                        {title}
                    </Typography>
                </div>
                {vertical ? <SkeletonVertical /> : <SkeletonHorizontal />}
            </div>
        );
    }


    return (
        <div>
            <div className="flex justify-between items-center px-4 py-1">
                <Typography component="div" variant="h6" color="white"
                            className="font-extrabold tracking-tight text-white">
                    {title}
                </Typography>

            </div>

            <div ref={containerRef} className="relative w-full flex flex-col gap-1 px-2 ">

                <div className="relative flex ">
                    <div
                        className="flex gap-4 transition-transform duration-500 ease-in-out "
                        style={{
                            width: '100%',
                            transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                            transition: 'transform 0.5s ease-in-out',
                        }}
                    >
                        {data.map((item, index) => (
                            <div
                                key={index}
                                style={{
                                    width: `${100 / visibleItems}%`,
                                    transition: "opacity 0.5s ease-in-out",
                                }}
                                className="flex-shrink-0"

                                onMouseEnter={() => setHide(true)}
                                onMouseLeave={() => setHide(false)}
                            >
                                 <DetailedCard movie={item}/>
                            </div>
                        ))}
                    </div>
                </div>
                <button
                    onClick={handlePrevClick}
                    style={{
                        opacity: hide ? "0" : "1",
                        transition: "opacity 0.5s ease-in-out",
                    }}
                    className="absolute top-1/2 left-5 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-md focus:outline-none"
                >
                    <ChevronLeft fontSize={'large'}/>

                </button>
                <button
                    style={{
                        opacity: hide ? "0" : "1",
                        transition: "opacity 0.5s ease-in-out",
                    }}
                    onClick={handleNextClick}
                    className="absolute top-1/2 right-5 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2  rounded-md focus:outline-none"
                >
                    <ChevronRight fontSize={'large'}/>
                </button>
            </div>
        </div>
    );
};

export default Carousel;
