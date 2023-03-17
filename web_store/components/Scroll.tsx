import React, {MutableRefObject, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Box} from "@mui/material";
import Header from "./Header";
import {ChevronRight, ChevronLeft} from "@mui/icons-material";


export default function Scroll({title, children}: { title?: String, children: any}) {
    let scrl = useRef() as MutableRefObject<HTMLDivElement>;
    const [scroll, setScroll] = useState(0);
    const [scrollEnd, setScrollEnd] = useState(false);
    const [show, setShow] = useState(false);

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
                    p: 1,
                }}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >

                {scroll !== 0 && (
                    <Box className="button-container" sx={{display: show ? 'block' : 'none', left: '10px', top: '40%'}}>
                        <Box className="button" onClick={() => slide(-150)}>
                            <ChevronLeft color="primary" sx={{fontSize:"3.5rem"}}/>
                        </Box>
                    </Box>

                )}

                <Box className="container__scroll" ref={scrl} onScroll={scrollCheck}>
                    {children}
                </Box>

                {!scrollEnd && (
                    <Box className="button-container" sx={{right: '10px', top: '40%', display: show ? 'block' : 'none'}}>
                        <Box className="button" onClick={() => slide(150)}>
                            <ChevronRight color="primary" sx={{fontSize:"3.5rem"}}/>
                        </Box>
                    </Box>
                )}

            </Box>
        </Box>

    )
}