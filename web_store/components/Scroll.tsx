import React, {MutableRefObject, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronRight, faChevronLeft} from "@fortawesome/free-solid-svg-icons";
import {Box} from "@mui/material";
import Header from "./Header";


export default function Scroll({title, children}: { title?: String, children: any}) {
    let scrl = useRef() as MutableRefObject<HTMLDivElement>;
    const [scroll, setScroll] = useState(0);
    const [scrollEnd, setScrollEnd] = useState(false);


    const slide = (shift: any) => {
        scrl.current.scrollLeft += shift;
        setScroll(scroll + shift);

        //For checking if the scroll has ended
        if (
            Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
            scrl.current.offsetWidth
        ) {
            setScrollEnd(true);
        } else {
            setScrollEnd(false);
        }
    }

    //This will check scroll event and checks for scroll end
    const scrollCheck = () => {
        setScroll(scrl.current.scrollLeft);
        if (
            Math.floor(scrl.current.scrollWidth - scrl.current.scrollLeft) <=
            scrl.current.offsetWidth
        ) {
            setScrollEnd(true);
        } else {
            setScrollEnd(false);
        }
        console.log(scrollEnd);
    };

    return (

        <Box>
            {title &&
                <Header title={title} />
            }

            <Box
                sx={{
                    position: 'relative',
                    padding: '10px 0px',

                }}
            >

                {scroll !== 0 && (
                    <Box className="button" onClick={() => slide(-150)}>
                        <FontAwesomeIcon icon={faChevronLeft} size="3x" color="#0F52BA"/>
                    </Box>
                )}

                <Box className="container__scroll" ref={scrl} onScroll={scrollCheck}>
                    {children}
                </Box>

                {!scrollEnd && (
                    <Box className="button" style={{right: '0', top: '0'}} onClick={() => slide(150)}>
                        <FontAwesomeIcon icon={faChevronRight} size="3x" color="#0F52BA"/>
                    </Box>
                )}

            </Box>
        </Box>

    )
}