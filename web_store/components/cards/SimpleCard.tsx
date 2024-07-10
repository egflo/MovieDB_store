import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";
import {Card, CardActionArea, CardContent, Chip, withStyles} from "@mui/material";
import TheatersIcon from "@mui/icons-material/Theaters";
import Rate from "../actions/Rate";
import Favorite from "../actions/Favorite";
import Cart from "../actions/Cart";
import {CustomRateUI} from "../actions/RateUI";


interface SearchItemProps {
    movie: Movie
    onBookmarkAdded: (id: string) => void;
    onBookmarkRemoved: (id: string) => void;
}

export const SimpleCard = (props: SearchItemProps) => {
    const router = useRouter();
    const {movie} = props;
    const ref = useRef<Element | null>(null)
    const [mounted, setMounted] = useState(false)

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
                <div className={"relative w-full h-40 bg-zinc-950"}>

                    <TheatersIcon
                        className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150'} color={'primary'}/>

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
                </div>
            )
        }
        else {
            return (
                <div className={"relative w-full h-40"}>

                    <img src={movie.background} alt="Movie" draggable={false}
                         className="object-cover w-full h-full rounded-t-md" />

                    {movie.logo && (<img src={movie.logo} alt={movie.title} draggable={false} className="absolute bottom-2 left-2 w-40 object-contain"/>)}

                    {!movie.logo && (
                        <Typography variant="inherit" component="div" color="text.secondary"
                                    className="absolute bottom-2 left-2 text-white text-shadow-black font-semibold text-md overflow-ellipsis overflow-hidden line-clamp-1">
                            {movie.title}
                        </Typography>
                    )}

                </div>
            )
        }
    }

    useEffect(() => {
        ref.current = document.getElementById(movie.id);
        setMounted(true)
    } , [])


    // @ts-ignore
    return (

        <>
            <Card
                className={`md:hidden rounded-md group duration shadow-xl transition ease-in-out hover:shadow-2xl w-40 h-60  bg-zinc-950`}
                onClick={() => handleCardClick(movie.movieId)}>
                {testURL(movie.poster) ? (

                    <img src={movie.poster} alt={movie.title} draggable={false} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>


                ) : (
                    <div
                        style={{width: '100%', height: '100%', position: 'relative', padding:2}}>

                        <TheatersIcon
                            className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-125'}
                            fontSize={'large'} color={'primary'}/>

                        <Typography variant="caption" color="text.secondary" component="div" style={{
                            position: 'absolute',
                            top: '65%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineClamp: 2,
                            overflow: 'hidden',
                        }}>
                            {movie.title}
                        </Typography>

                    </div>
                )}
            </Card>


        <Card
            className={`
            hidden
            md:block
            rounded-md
            group
            duration
            shadow-xl
            transition
            ease-in-out
            hover:shadow-2xl
            w-72 
            h-80
            min-w-full
            min-h-full
            bg-zinc-950
        `}>

            <CardContent className={'flex flex-col p-0 h-full'}>

                <div className="relative w-full h-48 rounded-t-md bg-black cursor-pointer"
                     onClick={() => handleCardClick(movie.movieId)}
                >
                    <BackgroundImage/>
                </div>

                <div className="w-full h-full flex flex-col gap-1 pt-1 pr-2 pl-2 pb-2">

                    <Box className=" flex flex-row items-start gap-2 ">

                        <Favorite
                            movie={movie}
                            onBookmarkAdded={props.onBookmarkAdded}
                            onBookmarkRemoved={props.onBookmarkRemoved}
                        />


                        <Rate movie={movie}>
                            <CustomRateUI></CustomRateUI>
                        </Rate>

                        <Cart movie={movie}/>

                    </Box>


                    <Box className="flex flex-row items-start align-content-center gap-1">

                        <Chip label={movie.year} size="small"/>

                        {movie.rated &&
                            <Chip label={movie.rated} size="small"/>
                        }

                        {movie.genres && movie.genres.length > 0 && (
                            <Chip label={movie.genres[0]} size="small"/>
                        )}
                    </Box>

                    <Typography variant="body2"
                                className="text-white overflow-ellipsis overflow-hidden line-clamp-3">
                        {movie.plot}
                    </Typography>
                </div>

            </CardContent>
        </Card>

        </>

    );
}
