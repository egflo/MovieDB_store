import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import {theme} from "../../pages/_app";
import {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import {Chip} from "@mui/material";
import TheatersIcon from "@mui/icons-material/Theaters";
import Favorite from "../actions/Favorite";
import Rate from "../actions/Rate";
import Cart from "../actions/Cart";
import {CustomRateUI} from "../actions/RateUI";

interface SearchItemProps {
    movie: Movie
}



export const DetailedCard = ({movie}: SearchItemProps) => {
    const router = useRouter();
    const ref = useRef<HTMLDivElement | null>(null)
    const cardRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if(ref.current ||cardRef.current == null) {
            return;
        }

        const handleMouseEnter = () => {
            const rect = ref.current.getBoundingClientRect();
            const offset = 20; // adjust this value to create a buffer zone around the viewport
            if (rect.right + offset > window.innerWidth) {
                cardRef.current.style.right = `${rect.right + offset - window.innerWidth}px`;
            } else if (rect.left - offset < 0) {
                cardRef.current.style.left = `${-rect.left + offset}px`;
            }
        };

        const handleMouseLeave = () => {
            cardRef.current.style.right = '0px';
            cardRef.current.style.left = '0px';
        };


        ref.current.addEventListener('mouseenter', handleMouseEnter);
        ref.current.addEventListener('mouseleave', handleMouseLeave);


        return () => {

            ref.current.removeEventListener('mouseenter', handleMouseEnter);
            ref.current.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);



    function handleCardClick(movieId: string) {
        router.push(`/movie/${movieId}`);
    }

    function testURL(url: string) {

        if (url == null) {
            return false
        }
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    function BackgroundImage() {

        if(movie.background == null || !testURL(movie.background)) {
            return (
                <>

                    <TheatersIcon
                        className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-125'}
                        fontSize={'large'} color={'primary'}/>


                    <Typography variant="subtitle2" color="text.secondary" component="div" style={{
                        position: 'absolute',
                        top: '80%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {movie.title}
                    </Typography>

                </>
            )
        }
        else {
            return (
                <>
                    <Box
                        className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-zinc-900 to-transparent"/>

                    <img src={movie.background} alt="Movie" draggable={false}
                         className="object-cover w-full h-full"/>
                </>
            )
        }
    }

    function title() {
        if (movie.logo != null) {
            return (
                <div className="flex flex-row items-center gap-2">
                    <img src={movie.logo} alt="Movie" className="w-50 h-25" />
                </div>
            )
        }
        else {
            return (
                <Typography variant="subtitle1" color="white" component="div" style={{

                    fontWeight: 'bold',
                    textAlign: 'left',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {movie.title}
                </Typography>
            )
        }
    }

    // @ts-ignore
    return (
        <Box
            ref={ref}
            className="
            border-2-amber-200
            group
            relative
            bg-zinc-900
            shadow-xl
            cursor-pointer
            transition duration-500 ease-in-out
            transform hover:-translate-y-0 -translate-x-0 hover:scale-110
            w-full h-full
            min-w-full
            min-h-full
            rounded-md
            "
        >

            <Box
                className="
                cursor-pointer
                transition
                duration
                shadow-xl
                group-hover:opacity-90
                sm:group-hover:opacity-0
                w-full h-full
                "
            >

                <Box onClick={() => handleCardClick(movie.movieId)} ref={ref} className="w-full h-full ">
                    {testURL(movie.background) ? (

                        <img src={movie.background} alt="Movie" draggable={false}
                             className="object-fit-fill w-full h-full rounded-3"/>

                    ) : (


                        <div className="relative w-full h-full " style={{overflow: 'hidden', borderRadius: '10px'}}>

                            <img src={"../../background.png"} alt="Movie" draggable={false}
                                 className="object-fit-fill w-full h-full rounded-3"/>

                            <div
                                className="absolute bottom-0 left-0 w-full h-full bg-zinc-950"/>


                            <TheatersIcon
                                className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-125'}
                                fontSize={'large'} color={'primary'}/>

                            <Typography variant="caption" color="text.secondary" component="div" style={{
                                position: 'absolute',
                                top: '80%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {movie.title}

                            </Typography>
                            <div/>

                        </div>

                    )}
                </Box>

            </Box>
            <Box
                ref={cardRef}

                className={`
                    bg-zinc-950
                    rounded-3
                    duration
                    shadow-xl
                    absolute
                    -bottom-24
                    left-0
                    transition
                    duration-200
                    scale-0
                    md:group-hover:focus-within:scale-100
                    md:group-hover:focus:scale-100
                    md:group-hover:scale-100
                    group-hover:opacity-100
                    `}
            >

                <Box
                    sx={{
                        zIndex: theme.zIndex.drawer + 98,

                    }}
                >

                    <Box className="relative w-full h-52" onClick={() => handleCardClick(movie.movieId)}>

                        <Box className={"relative w-full h-full pb-1"} style={{overflow: 'hidden', borderRadius: '10px'}}>
                            <BackgroundImage />
                        </Box>

                        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-zinc-950 to-transparent" />

                        <Box className="flex flex-row items-center gap-2 absolute bottom-0 left-2">
                            {title()}
                        </Box>
                    </Box>

                    <Box className="flex flex-col gap-2 pr-2 pl-2" id={movie.id}>

                        <Box className="flex flex-row items-start gap-2">
                            <Favorite movie={movie} />
                            <Rate movie={movie}>
                                <CustomRateUI></CustomRateUI>
                            </Rate>
                            <Cart movie={movie} />
                        </Box>

                        <Box className="flex flex-row items-start align-content-center gap-2">

                            <Chip label={movie.year} size="small" />

                            {movie.rated &&
                                <Chip label={movie.rated} size="small" />
                            }

                            {movie.genres && movie.genres.length > 0 && (
                                <Chip label={movie.genres[0]} size="small"  />
                            )}

                        </Box>

                        <Typography variant="body2"
                                    className="text-white overflow-ellipsis overflow-hidden line-clamp-3">
                            {movie.plot}
                        </Typography>

                    </Box>
                </Box>

            </Box>
        </Box>
    );
}
