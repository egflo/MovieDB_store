import Box from "@mui/material/Box";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const movies = ["tt0468569", "tt4154756", "tt1375666","tt2488496"];
const delay = 4000;
import React, {useEffect} from "react";
import {HeroItem} from "./Hero-Item";

export const Hero = () => {
    const [index, setIndex] = React.useState(0);
    const timeoutRef = React.useRef(null);

    function resetTimeout() {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
        resetTimeout();
        // @ts-ignore
        timeoutRef.current = setTimeout(
            () =>
               setIndex((prevIndex) =>
                    prevIndex === movies.length - 1 ? 0 : prevIndex + 1
                ),
            delay
        );

        return () => {
            resetTimeout();
        };
    }, [index]);

    return (

        <Box
            className="h-[55vh] w-full overflow-hidden position-relative">

            <Box
                className="h-full w-full top-0 left-0"
            >

                {movies.map((movie, i) => (
                    <Box
                        key={movie}
                           className="h-full w-full absolute top-0 left-0 transition ease-in-out duration-1000"
                            style={{opacity: i === index ? 1 : 0}}
                    >
                        <HeroItem id={movie} />
                    </Box>
                ))}

            </Box>

            <div className="slideshowDots hidden md:block">
                {movies.map((_, idx) => (
                    <div
                        key={idx}
                        className={`slideshowDot${index === idx ? " active" : ""}`}
                        onClick={() => {
                            setIndex(idx);
                        }}
                    ></div>
                ))}
            </div>



        </Box>
  );
};
