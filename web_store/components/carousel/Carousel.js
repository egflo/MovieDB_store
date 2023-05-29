import React, {Children, useEffect, useState} from 'react'
import Button from "@mui/material/Button";
import {ChevronLeft, ChevronRight} from "@mui/icons-material";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const Carousel = (props) => {
    const {children, show, infiniteLoop,hide, setHide} = props
    const [currentIndex, setCurrentIndex] = useState(infiniteLoop ? show : 0)
    const [length, setLength] = useState(children.length)

    const [isRepeating, setIsRepeating] = useState(infiniteLoop && children.length > show)
    const [transitionEnabled, setTransitionEnabled] = useState(true)

    const [touchPosition, setTouchPosition] = useState(null)

    // Set the length to match current children from props
    useEffect(() => {
        setLength(children.length)
        setIsRepeating(infiniteLoop && children.length > show)
    }, [children, infiniteLoop, show])

    useEffect(() => {
        if (isRepeating) {
            if (currentIndex === show || currentIndex === length) {
                setTransitionEnabled(true)
            }
        }
    }, [currentIndex, isRepeating, show, length])

    const next = () => {

        if (isRepeating || currentIndex < (length - show)) {
            setCurrentIndex(prevState => prevState + 1)
        }
    }

    const prev = () => {
        if (isRepeating || currentIndex > 0) {
            setCurrentIndex(prevState => prevState - 1)
        }
    }

    const handleTouchStart = (e) => {
        const touchDown = e.touches[0].clientX
        setTouchPosition(touchDown)
    }

    const handleTouchMove = (e) => {
        const touchDown = touchPosition

        if(touchDown === null) {
            return
        }

        const currentTouch = e.touches[0].clientX
        const diff = touchDown - currentTouch

        if (diff > 5) {
            next()
        }

        if (diff < -5) {
            prev()
        }

        setTouchPosition(null)
    }

    const handleTransitionEnd = () => {
        if (isRepeating) {
            if (currentIndex === 0) {
                setTransitionEnabled(false)
                setCurrentIndex(length)
            } else if (currentIndex === length + show) {
                setTransitionEnabled(false)
                setCurrentIndex(show)
            }
        }
    }

    const renderExtraPrev = () => {
        let output = []
        for (let index = 0; index < show; index++) {
            output.push(children[length - 1 - index])
        }
        output.reverse()
        return output
    }

    const renderExtraNext = () => {
        let output = []
        for (let index = 0; index < show; index++) {
            output.push(children[index])
        }
        return output
    }

    const indictors = () => {
        let output = []
        for (let index = 0; index < length; index++) {
            output.push(<Box key={index} className={`indicator ${currentIndex === index ? "active" : ""}`}></Box>)
        }
        return output
    }

    return (

        <Box className="carousel-container">
            <Box className="flex justify-between items-center px-4 py-1">
                <Typography component="div" variant="h6" color="white" className="font-extrabold tracking-tight text-white">
                    {props.title}
                </Typography>

                <Box className="container-indicators ">

                </Box>
            </Box>


            <Box
                onMouseEnter={() => setHide(false)}
                onMouseLeave={() => setHide(true)}
                className="carousel-wrapper">
                {/* You can always change the content of the button to other things */}

                <Box className="carousel-content-wrapper"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                >
                    {
                        (isRepeating || currentIndex > 0) &&
                        <Box className={"left-arrow"}
                             sx={{position: "absolute", top: "50%", left: "0", opacity: hide ? "0" : "1", transition: "opacity 0.5s ease-in-out"}}>
                            <Button onClick={prev} className={"h-100"}>
                                <ChevronLeft style={{ fontSize: 45, color:"white"}}/>
                            </Button>
                        </Box>

                    }

                    <Box
                        className={`carousel-content show-${show}`}
                        style={{
                            transform: `translateX(-${currentIndex * (150 / show)}%)`,
                            transition: !transitionEnabled ? 'none' : undefined
                        }}
                        onTransitionEnd={() => handleTransitionEnd()}
                    >
                        {
                            (length > show && isRepeating) &&
                            renderExtraPrev()
                        }
                        {
                            children
                        }

                        {
                            (length > show && isRepeating) &&
                            renderExtraNext()
                        }
                    </Box>

                    {
                        (isRepeating || currentIndex < (length - show)) &&
                        <Box className={"right-arrow"}
                             sx={{position: "absolute", top: "50%", right: "0", opacity: hide ? "0" : "1", transition: "opacity 0.5s ease-in-out"}}>
                            <Button onClick={next} className={"h-100"}>
                                <ChevronRight style={{ fontSize: 45, color:"white"}}/>
                            </Button>
                        </Box>
                    }
                </Box>

            </Box>

        </Box>
    )
}

export default Carousel