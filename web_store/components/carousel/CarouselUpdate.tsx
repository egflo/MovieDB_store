import React, { useState } from 'react';
import Slider from 'react-slick';
import {Movie} from "../../models/Movie";
import {CarouselItem} from "./Carousel-Item";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {ChevronLeft, ChevronRight} from "@mui/icons-material"; // Import your custom styles if needed


interface CarouselProps {
    title: string;
    slides: Movie[];
}

const Carousel: React.FC<CarouselProps> = ({title, slides}) => {
    const slider = React.useRef(null);

    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [hide, setHide] = useState(true)
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 5,
        beforeChange: (current: number, next: number) => setCurrentSlide(next), currentSlide: currentSlide,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 5,
                    slidesToScroll: 5,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 4
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2
                }
            }
        ]
    };


    // @ts-ignore
    function onClick(slider, direction) {
        if (direction === "left") {
            slider?.current?.slickPrev()
        } else {
            slider?.current?.slickNext()
        }
    }
    return (
        <Box className="carousel-container">
            <Box className="flex justify-between items-center px-4 py-1">
                <Typography component="div" variant="h6" color="white" className="font-extrabold tracking-tight text-white">
                    {title}
                </Typography>

                <Box className="container-indicators ">

                </Box>
            </Box>

            <Box
                onMouseEnter={() => setHide(false)}
                onMouseLeave={() => setHide(true)}
                className="carousel-wrapper">
                {/* You can always change the content of the button to other things */}

                <Box className="carousel-content-wrapper">
                    <Box className={"left-arrow"}
                         sx={{position: "absolute", top: "50%", left: "0", opacity: hide ? "0" : "1", transition: "opacity 0.5s ease-in-out"}}>
                        <Button onClick={() =>  onClick(slider, "left")} className={"h-100"}>
                            <ChevronLeft style={{ fontSize: 45, color:"white"}}/>
                        </Button>
                    </Box>


                    <Slider ref={slider} {...settings}>
                        {slides.map((slide, index) => (
                            <CarouselItem movie={slide} key={index} hide={hide} setHide={setHide}/>
                        ))}
                    </Slider>


                    <Box className={"right-arrow"}
                         sx={{position: "absolute", top: "50%", right: "0", opacity: hide ? "0" : "1", transition: "opacity 0.5s ease-in-out"}}>
                        <Button onClick={() =>  onClick(slider, "right")} className={"h-100"}>
                            <ChevronRight style={{ fontSize: 45, color:"white"}}/>
                        </Button>
                    </Box>
                </Box>

            </Box>

        </Box>
    );

};

export default Carousel;
