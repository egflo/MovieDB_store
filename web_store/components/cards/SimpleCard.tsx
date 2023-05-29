import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
    Add,
    Favorite,
    ShoppingBagOutlined,
    FavoriteBorderOutlined,
    ThumbDownAltOutlined,
    ThumbUpOffAltOutlined, Remove, ShoppingBag, InfoOutlined
} from "@mui/icons-material";
import {useRouter} from "next/router";
import {useEffect, useRef, useState} from "react";

import IconButton from "@mui/material/IconButton";
import {Card, CardActionArea, CardContent, Chip, withStyles} from "@mui/material";
import {ToastType} from "../Toast";
import {auth, axiosInstance} from "../../utils/firebase";
import useToastContext from "../../hooks/useToastContext";
import useAuthContext from "../../hooks/useAuthContext";
import {AxiosResponse} from "axios";
import TheatersIcon from "@mui/icons-material/Theaters";
import {Bookmark} from "../../models/Bookmark";
import {SentimentState} from "../../models/SentimentState";


interface ItemPropsItemProps {
    movie: Movie;
}

const RATE_URL : string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/sentiment/rate`
const BOOKMARK_URL = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/bookmark/`
const CART_URL:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;



enum RateType {
    LIKE = "like",
    DISLIKE = "dislike",
    LOVE = "love",
}

// @ts-ignore
const Cart = ({movie}) => {
    const {show} = useToastContext();
    const [selected, setSelected] = useState(false);
    const [quantity, setQuantity] = useState(1);

    function priceFormatter(price: number) {
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(price);
    }

    const handleSelected = async () => {

        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axiosInstance.post(CART_URL, {
                itemId: movie.item.id,
                userId: auth.currentUser?.uid,
                quantity: quantity,
            }).then((response) => {
                show("Added to cart", ToastType.INFO);
                setSelected(true);

            }).catch((error) => {
                show("Could not add to cart", ToastType.ERROR);
            });
        }
        else {
            show("You must be logged in to add to cart", ToastType.ERROR);
        }

    }


    //On Click change the state of the button
    return (

        <Box className="
                    button_test
                    border-1 border-gray-300
                    rounded-full
                    w-22
                    hover:bg-gray-700 hover:border-gray-700 hover:shadow-lg
                    flex
                    "
        >

            <IconButton
                className={"hover:bg-green-500 hover:border-gray-700 hover:shadow-lg"}
                onClick={handleSelected}>
                {selected ? <ShoppingBag className="text-white" fontSize={"small"}/> : <ShoppingBagOutlined className="text-white" fontSize={"small"}/> }
            </IconButton>

            <Box className="flex flex-row items-center gap-1">
                <Box className="p-1">
                    <Typography className="text-white text-xs">{priceFormatter(movie.item.price)}</Typography>
                </Box>
            </Box>
        </Box>
    )
}
// @ts-ignore
const Rate = ({movie}) => {
    const [state, setState] = useState(movie.sentiment? movie.sentiment.status : SentimentState.NONE);
    const ref = useRef<HTMLDivElement>(null);
    let toast = useToastContext();


    function handleSelected(type: RateType) {
        let user = auth.currentUser;
        if (user != null) {
            let uid = user.uid;
            user.getIdToken(true).then(function (idToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                axiosInstance.post(RATE_URL, {
                    objectId: movie.id,
                    status: type,
                    userId: uid,
                    created: Date.now()
                }).then((response: AxiosResponse) => {
                    if (response.status < 300) {
                        toast.show("Rating Updated", ToastType.INFO);
                    } else {
                        toast.show("Error updating rating", ToastType.ERROR);
                    }

                }).catch((error) => {
                    toast.show(error.response.data, ToastType.ERROR);
                });
            })
        }
        else {
            toast.show("Please login to rate this film", ToastType.ERROR);
        }
    }


    const ratings = () => {
        let output = [];


        output.push(
            <IconButton
                className={"hover:bg-blue-500 hover:border-gray-700 hover:shadow-lg"}
                onClick={() => handleSelected(RateType.LIKE)}>
                <ThumbUpOffAltOutlined fontSize={"small"}/>
            </IconButton>
        )

        output.push(
            <IconButton
                className={"hover:bg-blue-500 hover:border-gray-700 hover:shadow-lg"}
                onClick={() => handleSelected(RateType.DISLIKE)}>
                <ThumbDownAltOutlined fontSize={"small"} />
            </IconButton>
        )




    }

    return (
        <Box className="
                            button_test
                            border-1 border-gray-700
                            rounded-full
                            hover:bg-gray-700 hover:border-gray-700 hover:shadow-lg
                            flex
                            ">

            <IconButton
                className={"hover:bg-blue-500 hover:border-gray-700 hover:shadow-lg"}
                onClick={() => handleSelected(RateType.LIKE)}>
                <ThumbUpOffAltOutlined fontSize={"small"}/>
            </IconButton>

            <Box className="flex flex-row items-center gap-1">

                <IconButton
                    className={"hover:bg-blue-500 hover:border-gray-700 hover:shadow-lg"}
                    onClick={() => handleSelected(RateType.DISLIKE)}>
                    <ThumbDownAltOutlined fontSize={"small"} />
                </IconButton>

                <IconButton
                    className={"hover:bg-blue-500 hover:border-gray-700 hover:shadow-lg"}
                    onClick={() => handleSelected(RateType.LOVE)}>
                    <FavoriteBorderOutlined fontSize={"small"}/>
                </IconButton>
            </Box>
        </Box>

    )
}

// @ts-ignore
const BookmarkButton = ({movie}) => {
    const toast = useToastContext();
    const auth = useAuthContext();
    const [bookmarked, setBookmarked]
        = useState<Bookmark | null >(movie.bookmark);


    async function handleSelected() {
        if (!auth.isAuthenticated) {
            toast.show("You must be logged in to add to favorites", ToastType.ERROR);
            return;
        }

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        if (bookmarked) {
            const DELETE_BOOKMARK = `${BOOKMARK_URL}${bookmarked.id}`
            axiosInstance.delete(DELETE_BOOKMARK).then((response) => {
                if (response.status < 300) {
                    setBookmarked(response.data);
                    toast.show("Removed from favorites", ToastType.INFO);
                } else {
                    toast.show("Could not remove from favorites", ToastType.ERROR);
                }
            }).catch((error) => {
                toast.show(error.message, ToastType.ERROR);
            } );
        }
        else {

            axiosInstance.post(BOOKMARK_URL, {
                movieId: movie.id,
                userId: auth.user?.uid,
                created: new Date(),
            }).then((response) => {
                if (response.status === 200) {
                    setBookmarked(response.data);
                    toast.show("Added to favorites", ToastType.INFO);
                } else {
                    toast.show(response.data, ToastType.ERROR);
                }
            }).catch((error) => {
                toast.show(error.message, ToastType.ERROR);
            } );
        }
    }

    return (

        <Box
            className="rounded-full group-hover:opacity-100"
            onClick={handleSelected}
        >
            <IconButton
                className={"hover:bg-red-700 hover:border-gray-700 hover:shadow-lg"}
                onClick={handleSelected}
                sx={{
                    color: bookmarked ? "red" : "white",
                }}
                aria-label="add to favorites"
            >
                <FavoriteBorderOutlined fontSize={"small"}/>
            </IconButton>
        </Box>

    )

}

// @ts-ignore
const Info = ({movie}) => {
    const toast = useToastContext();
    const auth = useAuthContext();
    const router = useRouter();

    function handleSelected() {
        router.push(`/movie/${movie.movieId}`);
    }

    return (

        <Box
            className="rounded-full group-hover:opacity-100"
        >
            <IconButton
                className={"hover:bg-gray-700 hover:border-gray-700 hover:shadow-lg"}
                onClick={handleSelected}
                aria-label="Info about movie"
            >
                <InfoOutlined fontSize={"small"}/>
            </IconButton>
        </Box>

    )

}


interface SearchItemProps {
    movie: Movie
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

        if(movie.background == null || testURL( movie.background) == false) {
            return (
                <div className={"relative w-full h-full rounded-t-md bg-black"}>

                    <TheatersIcon
                        className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-125'}
                        fontSize={'large'} color={'primary'}/>


                    <Typography variant="subtitle2" color="text.secondary" component="div" style={{
                        position: 'absolute',
                        top: '70%',
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
                <div className={"relative w-full h-full"}>


                    <img src={movie.background} alt="Movie" draggable={false}
                         className="object-cover w-full h-full rounded-t-md" />


                    {movie.logo && (<img src={movie.logo} alt={movie.title} draggable={false} className="absolute bottom-0 left-5 w-50 object-contain"/>)}

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

            <Card
                sx={{ minWidth: 275, maxWidth: 275, cursor: 'pointer' }}

                 className={`
                    rounded-md
                    group
                    duration
                    shadow-xl
                    transition
                    ease-in-out
                    hover:shadow-2xl
                `}>


                <div className="relative w-full h-48 rounded-t-md bg-black">
                    <BackgroundImage />
                </div>

                <CardContent
                    sx={{height: 200}}
                    className=" w-full flex flex-col gap-1 rounded-b-md">

                    <Box className="flex flex-row items-start gap-2">

                        <BookmarkButton movie={movie} />
                        <Rate movie={movie} />
                        <Cart movie={movie} />

                        <Info movie={movie} />

                    </Box>

                    <Typography variant="inherit" component="div" className="text-white font-semibold text-md overflow-ellipsis overflow-hidden line-clamp-1">
                        {movie.title}
                    </Typography>


                    <Box className="flex flex-row items-start align-content-center gap-1">


                        <Chip label={movie.year} size="small" sx={{fontSize:"0.7rem"}}/>


                        {movie.rated &&
                            <>
                                <Chip label={movie.rated} size="small" sx={{fontSize:"0.7rem"}} />

                            </>

                        }

                        {movie.genres && movie.genres.length > 0 && (
                            <Chip label={movie.genres[0]} size="small" sx={{fontSize:"0.7rem"}} />
                        )}
                    </Box>

                    <Typography variant="body2"
                                className="text-white text-opacity-80 overflow-ellipsis overflow-hidden line-clamp-3">
                        {movie.plot}
                    </Typography>

                </CardContent>
            </Card>

    );
}
