import React, {MutableRefObject, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Box} from "@mui/material";
import Header from "./Header";
import {ChevronRight, ChevronLeft} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import {bgcolor} from "@mui/system";


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
    };

    return (


            <Box
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            >
                {title && (

                    <Box className="title" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: 5, height: 24, backgroundColor: 'primary.main', borderRadius:1 }} />

                        <Typography variant="h6" sx={{ color: "white", marginLeft: 1}}>
                            {title}
                        </Typography>
                    </Box>
                )}


                {scroll !== 0 && (
                    <Box className="button-container" sx={{ left: '10px', top: '45%', opacity: show ? 1 : 0 }}>
                        <Box className="button" onClick={() => slide(-450)}>
                            <ChevronLeft fontSize={"large"} color="inherit" sx={{color:"white"}}/>
                        </Box>
                    </Box>

                )}

                <Box className="container__scroll" ref={scrl} onScroll={scrollCheck}>
                    {children}
                </Box>

                {!scrollEnd && (
                    <Box className="button-container" sx={{right: '10px', top: '45%', opacity: show ? 1 : 0}}>
                        <Box className="button" onClick={() => slide(450)}>
                            <ChevronRight fontSize={"large"} color="inherit" sx={{color:"white"}}/>
                        </Box>
                    </Box>
                )}

            </Box>

    )
}