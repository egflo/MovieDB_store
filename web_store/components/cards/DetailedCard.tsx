import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import {
    Add,
    Favorite,
    ShoppingBagOutlined,
    FavoriteBorderOutlined,
    Info,
    ThumbDownAltOutlined,
    ThumbUpOffAltOutlined, Remove, ShoppingBag
} from "@mui/icons-material";
import {useRouter} from "next/router";
import {theme} from "../../pages/_app";
import {useEffect, useRef, useState} from "react";
import IconButton from "@mui/material/IconButton";
import {Chip, withStyles} from "@mui/material";
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
                console.log(error);
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

interface SearchItemProps {
    movie: Movie
}

export const DetailedCard = (props: SearchItemProps) => {
    const router = useRouter();
    const {movie} = props;
    const ref = useRef<Element | null>(null)
    const [mounted, setMounted] = useState(false)
    const [edge, setEdge] = useState(false)

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
                <div className={"relative w-full h-full rounded-t-md"}>

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

                    <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-zinc-900 to-transparent" />

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


    function edgeOfScreen() {
        if (ref.current == null) {
            return false;
        }
        const rect = ref.current.getBoundingClientRect();
        return (
            rect.top < 0 ||
            rect.left < 0 ||
            rect.bottom > (window.innerHeight || document.documentElement.clientHeight) ||
            rect.right + 500 > (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // @ts-ignore
    return (
        <Box
            ref={ref}
            onMouseEnter={() => {
                setEdge(edgeOfScreen())
            }}
            onMouseLeave={() => {
                setEdge(false)
            }}
            sx={{
                '&:hover': {
                    zIndex: theme.zIndex.drawer + 99,
                }
            }}
            className="
            group
            relative
            bg-zinc-900
            rounded-md
            shadow-xl
            cursor-pointer
            transition duration-500 ease-in-out
            transform hover:-translate-y-1 hover:scale-110
            w-full h-full
            min-w-full
            min-h-full
            "
        >


            <div
                onClick={() => handleCardClick(movie.movieId)}
                className="
                rounded-md
                cursor-pointer
                transition
                duration
                shadow-xl
                rounded
                group-hover:opacity-90
                sm:group-hover:opacity-0
                w-full h-full
                min-w-full
                min-h-full
                "
            >

                {testURL(movie.background) ? (

                    <img src={movie.background} alt="Movie" draggable={false}
                            className="object-cover w-full h-full" />

                    ) : (
                        <div className={"relative w-full h-full rounded"}>

                            <img src={"/background.png"} alt="Movie" draggable={false}
                                 className="object-cover w-full h-full" />

                            <div className="absolute bottom-0 left-0 w-full h-full bg-zinc-800" />

                            <TheatersIcon
                                className={'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-125'}
                                fontSize={'large'} color={'primary'}/>


                            <Typography variant="caption" color="text.secondary" component="div" style={{
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
                    )}
            </div>
            <Box
                className={`
                    group-hover:z-50
                    bg-zinc-900
                    duration
                    shadow-xl
                    absolute
                    transition
                    duration-200
                    sm:visible
                    scale-0
                    md:group-hover:focus-within:scale-100
                    md:group-hover:focus:scale-100
                    md:group-hover:scale-110
                    md:group-hover:-translate-y-[11vw]
                    md:group-hover:translate-x-[-1vw]
                    group-hover:opacity-100
                    h-[35vw]
                    w-[75vw]
                    md:w-[25vw]
                    md:h-[25vw]
                    `}>


                <Box className="rounded-t-md  w-full  h-[40vw] md:h-[15vw] bg-zinc-800 relative">

                    <BackgroundImage />

                </Box>


                <Box className="p-2 flex flex-col gap-1 bg-zinc-900 rounded-b-md " id={movie.id}>

                    <Box className="flex flex-row items-start gap-2">

                        <BookmarkButton movie={movie} />
                        <Rate movie={movie} />
                        <Cart movie={movie} />

                    </Box>

                    <Typography variant="inherit" component="div" className="text-white font-semibold text-md">
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

                    <Typography variant="caption"
                                className="text-white text-opacity-80 overflow-ellipsis overflow-hidden line-clamp-3">
                        {movie.plot}
                    </Typography>

                    <Button variant="contained"  color={"primary"} className="mt-2 w-full bg-blue-800"
                            onClick={() => handleCardClick(movie.movieId)}>
                        <Info className="mr-2" />
                        More Info
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}
