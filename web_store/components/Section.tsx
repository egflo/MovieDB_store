import {Movie} from "../models/Movie";
import React, {useEffect, useRef, useState} from "react";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import {DetailedCard} from "./cards/DetailedCard";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { CircularProgress } from "@mui/material";
import VerticalCard from "./cards/VerticalCard";
import Slider from "react-slick";
import {CarouselItem} from "./carousel/Carousel-Item";
import Typography from "@mui/material/Typography";





interface SectionProps {
    title: string;
    path: string;
    authenticated: boolean;
}

const Section: React.FC<SectionProps> = ({title, path, authenticated }) => {
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const { data, isLoadingMore, isReachingEnd, setSize } = useInfiniteScroll(path, authenticated);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hide, setHide] = useState(true)
    const [scrollIndex, setScrollIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);



    useEffect(() => {
        const handleScroll = () => {
            if (scrollContainerRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
                if (scrollLeft + clientWidth >= scrollWidth && !isReachingEnd) {
                    setSize(size => size + 1);
                }
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [setSize, isReachingEnd]);

    const handleScrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft += 300;
            setScrollIndex(scrollIndex + 1);
            console.log(scrollIndex);
            console.log(scrollContainerRef.current.scrollLeft);
        }
    };

    const handleScrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft -= 300;
            setScrollIndex(scrollIndex - 1);
        }
    };

    const showLeftButton = scrollIndex > 0;
    const showRightButton = scrollIndex < data.length - 1 && !isReachingEnd;

    // @ts-ignore
    return (
        <Box className="carousel-container">
            <Box className="flex justify-between items-center px-4 py-1">
                <Typography component="div" variant="h6" color="white" className="font-extrabold tracking-tight text-white">
                    {title}
                </Typography>
            </Box>

            <Box
                onMouseEnter={() => setHide(false)}
                onMouseLeave={() => setHide(true)}
                className="carousel-wrapper">
                <Box className="carousel-content-wrapper">
                    <Box className={"left-arrow"}
                         sx={{position: "absolute", top: "50%", left: "0", opacity: hide ? "0" : "1", transition: "opacity 0.5s ease-in-out"}}>
                        <Button>
                            <ChevronLeft style={{ fontSize: 45, color:"white"}}/>
                        </Button>
                    </Box>


                    <Box className="flex gap-4 w-full h-full px-4"
                         sx={{
                             scrollBehavior: 'smooth',
                             '&::-webkit-scrollbar': { display: 'none' }
                         }}
                         ref={scrollContainerRef}>
                        {data.map((movie: Movie, index: number) => (
                            <Box className="carousel-container" key={index}>
                                <div className={"w-64 h-96"}>
                                    <VerticalCard movie={movie}/>

                                </div>
                            </Box>

                        ))}
                        {isLoadingMore && <CircularProgress />}
                    </Box>

                    <Box className={"right-arrow border-2"}
                         sx={{position: "absolute", top: "50%", right: "0", opacity: hide ? "0" : "1", transition: "opacity 0.5s ease-in-out"}}>
                        <Button onClick={handleScrollRight}>
                            <ChevronRight style={{ fontSize: 45, color:"white"}}/>
                        </Button>
                    </Box>
                </Box>

            </Box>

        </Box>
    );
};


export default Section;