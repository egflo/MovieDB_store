// Carousel.tsx
import React, { useEffect, useRef, useState } from 'react';
import {Add, MoreVert, ShoppingBagOutlined} from "@mui/icons-material";
import {Typography} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from "@mui/material/Box";
import {
    Remove,
    FavoriteBorderOutlined,
    ThumbDownAltOutlined,
    ThumbUpOffAltOutlined
} from "@mui/icons-material";
import {useRouter} from "next/router";
import {Movie} from "../../models/Movie";
import useToastContext from "../../hooks/useToastContext";
import {axiosInstance, auth} from "../../utils/firebase";
import {ToastType} from "../Toast";
import  {AxiosResponse} from "axios";
import useDominantColor from "../../hooks/useDominantColor";
import TheatersIcon from "@mui/icons-material/Theaters";
import {RateType} from "../../models/RateType";
import {useBookmarkContext} from "../../contexts/BookmarkContext";

const RATE_API : string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/sentiment/rate`
const CART_URL:string = `${process.env.NEXT_PUBLIC_INVENTORY_SERVICE_NAME}/cart/`;

function IconMenu({ movie, onMenuOpen }: { movie: Movie, onMenuOpen: (isOpen: boolean) => void }) {
    const {addBookmark, removeBookmark, getBookmark, error} = useBookmarkContext();
    const bookmark = getBookmark(movie.id);


    const ref = useRef<HTMLDivElement>(null);
    const [selected, setSelected] = React.useState(false);// @ts-ignore
    let toast = useToastContext();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
        onMenuOpen(true);
    };

    const handleClose = () => {
        setAnchorEl(null);
        onMenuOpen(false);
    };

    function priceFormatter(price: number) {
        const convert = price / 100;
        return new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(convert);
    }


    const handleBookmark = async () => {
        if (!auth.currentUser) {
            toast.show("You must be logged in to add to favorites", ToastType.ERROR);
            return;
        }

        try {
            if (bookmark) {
                await removeBookmark(bookmark.id);
                toast.show('Removed from favorites', ToastType.SUCCESS);
                handleClose();

            } else {
                await addBookmark(movie.id);
                toast.show('Added to favorites', ToastType.SUCCESS);
                handleClose();

            }
        } catch (error) {
            toast.show('An error occurred while updating the bookmark', ToastType.ERROR);
            handleClose();

        }
    };

    const handleCart = async () => {

        if (auth.currentUser != null) {
            const token = await auth.currentUser?.getIdToken(true);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            axiosInstance.post(CART_URL, {
                itemId: movie.id,
                userId: auth.currentUser?.uid,
                quantity: 1,
            }).then((response) => {
                toast.show("Added to cart", ToastType.INFO);
                setSelected(true);
                handleClose();

            }).catch((error) => {
                toast.show("Could not add to cart", ToastType.ERROR);
                handleClose();
            });
        }
        else {
            toast.show("You must be logged in to add to cart", ToastType.ERROR);
            handleClose();
        }

    }

    function handleSelected(type: RateType) {
        let user = auth.currentUser;
        if (user != null) {
            let uid = user.uid;
            user.getIdToken(true).then(function (idToken) {
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;

                axiosInstance.post(RATE_API, {
                    objectId: movie.id,
                    status: type,
                    userId: uid,
                    created: Date.now()
                }).then((response: AxiosResponse) => {
                    if (response.status < 300) {
                        console.log(response.data);
                        toast.show("Rating Updated", ToastType.INFO);
                        handleClose();
                    } else {
                        toast.show("Error updating rating", ToastType.ERROR);
                        handleClose();
                    }

                }).catch((error) => {
                    toast.show(error.response.data, ToastType.ERROR);
                    handleClose();
                });
            })

        }
        else {
            toast.show("Please login to rate this film", ToastType.ERROR);
            setAnchorEl(null);

        }
        setSelected(false);
    }

    return (
        <div>
            <IconButton
                className="p-2"
                id="basic-button"
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
            >
                <MoreVert className="text-white"/>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'basic-button',
                }}
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: 'rgba(0, 0, 0, 0.95)', // Change background color
                        color: 'white', // Change text color
                    },
                }}

            >
                <MenuItem onClick={handleBookmark}>
                    <Box className="flex flex-row gap-2 items-center">
                        {bookmark ? <Remove className="text-white"/> : <Add className="text-white"/>}
                        {bookmark ? "Remove from favorites" : "Add to favorites"}
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => handleSelected(RateType.LIKE)}>
                    <Box className="flex flex-row gap-4 items-center">
                        <ThumbUpOffAltOutlined className="text-white"/>
                        <Typography className={"text-white"}>Like</Typography>
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => handleSelected(RateType.DISLIKE)}>
                    <Box className="flex flex-row gap-4 items-center">
                        <ThumbDownAltOutlined className="text-white"/>
                        <Typography className={"text-white"}>Dislike</Typography>
                    </Box>
                </MenuItem>
                <MenuItem onClick={() => handleSelected(RateType.LOVE)}>
                    <Box className="flex flex-row gap-4 items-center">
                        <FavoriteBorderOutlined className="text-white"/>
                        <Typography className={"text-white"}>Love</Typography>
                    </Box>
                </MenuItem>
                <MenuItem onClick={handleCart}>
                    <Box className="flex flex-row gap-2 items-center">
                        <ShoppingBagOutlined className="text-white"/>
                        Add to bag for {priceFormatter(movie.item?.price!)}
                    </Box>
                </MenuItem>
            </Menu>
        </div>
    );
}

// @ts-ignore
const VerticalCard = ({movie}: {movie: Movie}) => {
    const router = useRouter();

    const proxySrc = `/api/proxy-image?src=${encodeURIComponent(movie.poster)}`;
    const { color, loading, error } = useDominantColor(proxySrc);
    const [isExpanded, setIsExpanded] = useState(false);

    //if (loading) return <div>Loading...</div>;
    //if (error) return <div className="text-red-500">Error: {error.message}</div>;

    const gradientColor = color ? `rgba(${color[0]}, ${color[1]}, ${color[2]}, 1)` : 'rgba(0,0,0,0.95)';

    const onClick = () => {
        console.log("Clicked");
        router.push(`/movie/${movie.movieId}`);
    }

    const testURL = (url: string) => {
        if (url == null) {
            return false
        }
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }


    function Poster() {
        if (testURL(movie.poster) || error) {
            //Url  is valid but it contains not found
            return (
                <img
                    src={movie.poster} alt={movie.poster} draggable={false} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
            )
        }
        else {
            return (
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
            )
        }
    }

    return (
        //\`2px solid \$\{gradientColor\}\`\,
        //Hov er effect set border to gradient color
        <Box
            className={`cursor-pointer rounded-lg overflow-hidden flex-shrink-0 w-full h-full max-w-72 transition-transform duration-300`}
            sx={{
                '&:hover': {
                    border:  loading ? '1px solid rgba(255, 255, 255, 0.5)' : `2px solid ${gradientColor}`,
                    transform: 'scale(1.15)',
                },
                ...(isExpanded && {
                    border: loading ? '1px solid rgba(255, 255, 255, 0.5)' : `2px solid ${gradientColor}`,
                    transform: 'scale(1.15)',
                }),
            }}
        >
            <Box className="relative min-w-full min-h-full rounded-lg overflow-hidden">
                {loading && (
                    <div className="w-full h-full bg-gray-800 animate-pulse">
                        <img src={movie.poster} alt={movie.title} draggable={false}
                           style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                    </div>
                )}
                {!loading && (
                    <div onClick={onClick} className="w-full h-full ">

                     <Poster/>
                    </div>
                )}

                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: `linear-gradient(0deg, ${gradientColor}, rgba(0,0,0,0.15))`}}
                ></div>

                <div className="absolute top-0 left-0 right-0  text-gray-50  h-full flex flex-col justify-content-end">
                    <div className="pr-2 pl-2 pb-3"
                         onClick={onClick}
                    >
                        {movie.logo && (
                            <img src={movie.logo} alt="Logo" className="w-full h-24"/>
                        )}

                        {!movie.logo && (
                            <Typography
                                className="text-xl font-bold text-white text-ellipsis text-center line-clamp-"
                            >{movie.title}</Typography>
                        )}

                        <div className="flex flex-row gap-1 items-center w-full align-items-center justify-content-center">

                            {movie.genres && movie.genres.length > 0 && (
                                <Typography className="text-sm opacity-85">{movie.genres.join(', ')}</Typography>
                            )}

                            <span className={"text-sm opacity-85"}>&#8226;</span>

                            {movie.year && (
                                <Typography className="text-sm opacity-85">{movie.year}</Typography>
                            )}

                        </div>
                    </div>

                    <div className="p-1 text-white bg-black bg-opacity-50 align-items-end justify-end w-full">
                        <div className="flex flex-row justify-between items-center">
                            <div className="flex flex-row gap-2 ">
                                <div className="hidden">

                                </div>
                            </div>
                            <IconMenu movie={movie} onMenuOpen={setIsExpanded} />
                        </div>
                    </div>
                </div>
            </Box>
        </Box>
    );
};


export default VerticalCard;
