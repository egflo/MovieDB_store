import {Page} from "../models/Page";
import {Movie} from "../models/Movie";
import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {CardActions} from "@mui/material";
import IconButton, {IconButtonProps} from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import {styled} from "@mui/material/styles";
import {useRouter} from "next/router";
import {CardStyle} from "./CardStyle";
import Favorite from "./actions/Favorite";
import Share from "./actions/Share";
import Rate from "./actions/Rate";
import {KeyedMutator} from "swr";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Cart from "./actions/Cart";
import Button from "@mui/material/Button";
import {Info, ShoppingBagOutlined} from "@mui/icons-material";
import TheatersIcon from "@mui/icons-material/Theaters";
import {axiosInstance} from "../utils/firebase";
import {SimpleCard} from "./cards/SimpleCard";

interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));



function MovieCard({style, movie}: {style: CardStyle, movie: Movie}) {
    const router = useRouter();
    const [expanded, setExpanded] = React.useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    function handleCardClick(movieId: string) {
        router.push(`/movie/${movieId}`);
    }

    function testURL(url: string) {

        if (url == null) {
            return false
        }
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    function CardVertical() {
        return (

            <Card sx={{ minWidth: 170, maxWidth: 170, cursor: 'pointer'}} onClick={() => handleCardClick(movie.movieId)}>
                {testURL(movie.poster) ? (

                    <CardMedia
                        component="img"
                        height="250"
                        image={testURL(movie.poster) ? movie.poster : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"}
                        alt={movie.title}
                    />
                ) : (
                        <div style = {{position:'relative', height:260}}>

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
                )}
            </Card>

        )
    }

    function CardHorizontal() {
        return (
            <Box className={"group bg-zinc-900 col-span relative h-[15vw] w-[25vw]"}>
                <img src={movie.poster} alt="Movie" draggable={false} className="
                cursor-pointer
                object-cover
                transition
                duration
                shadow-xl
                rounded-md
                group-hover:opacity-90
                sm:group-hover:opacity-0
                delay-300
                w-full
                h-[15vw]" />

                <Box className="
                    absolute
                    top-0
                    transition
                    duration-200
                    z-10
                    sm:visible
                    delay-300
                    w-full
                    scale-0
                    group-hover:focus-within:scale-100
                    group-hover:focus:scale-100
                    group-hover:scale-110
                    group-hover:-translate-y-[6vw]
                    group-hover:translate-x-[2vw]
                    group-hover:opacity-100">

                    <img  src={movie.poster} alt="Movie" draggable={false} className="
                      cursor-pointer
                      object-cover
                      transition
                      duration
                      shadow-xl
                      rounded-t-md
                      w-full
                      h-[12vw]" />

                    <Box className="
                      z-10
                      bg-zinc-800
                      p-2
                      lg:p-4
                      absolute
                      w-full
                      transition
                      shadow-md
                      rounded-b-md
                      ">
                        <Typography variant="h6" component="div" className="text-white font-semibold">
                            {movie.title}
                        </Typography>

                        <Box className="flex flex-row items-start align-content-center gap-1">

                            <Typography variant="subtitle2" className="text-white ">{movie.year}</Typography>

                            <Typography className="text-white">&bull;</Typography>

                            {movie.rated && movie.rated !== "NR" &&
                                <Typography variant="subtitle2" className="text-white">{movie.rated}</Typography>
                            }

                            <Typography className="text-white">&bull;</Typography>

                            {movie.genres && movie.genres.length > 0 && (
                                <Typography variant="subtitle2" className="text-white">{movie.genres[0]}</Typography>
                            )}
                        </Box>

                        <Typography variant="subtitle2"
                                    className="text-white text-opacity-80 overflow-ellipsis overflow-hidden">
                            {movie.plot}
                        </Typography>

                        <Button variant="contained" className="mt-2 w-full"
                                onClick={() => handleCardClick(movie.movieId)}>
                            <Info className="mr-2" />
                            More Info
                        </Button>

                    </Box>
                </Box>
            </Box>
        )
    }
    function CardExpanded() {
        return (
            <Card sx={{ width: 220, margin: 2}}>

                <CardMedia
                    onClick={() => handleCardClick(movie.movieId)}
                    component="img"
                    height="320"
                    image= {testURL(movie.poster) ? movie.poster : 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'}
                    alt={movie.title}
                />
                <CardContent>
                    <Typography noWrap variant="subtitle1" color="text.primary">
                        {movie.title}
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary" component="div">
                        <div style={{display:'flex', gap:'4px'}}>
                            {movie.year}

                            {movie.rated && movie.rated !== "NR" &&
                                <>
                                    <span className="separator" style={{color: "grey"}}>&bull;</span>
                                    <p>{movie.rated}</p>
                                </>
                            }

                            {movie.genres && movie.genres.length > 0 && (
                                <>
                                    <span className="separator" style={{color: "grey"}}>&bull;</span>
                                    <p>{movie.genres[0]}</p>
                                </>
                            )}
                        </div>

                    </Typography>



                </CardContent>

                <Divider sx={{
                    borderColor: 'grey.500',
                }}/>

                <CardActions disableSpacing sx={{color:'grey'}}>
                    <Favorite movie={movie}/>
                    <Share movie={movie}></Share>
                    <Rate movie={movie}></Rate>
                    <IconButton>
                        <ShoppingBagOutlined className="text-white" fontSize={"small"}/>
                    </IconButton>
                    <ExpandMore
                        expand={expanded}
                        onClick={handleExpandClick}
                        aria-expanded={expanded}
                        aria-label="show more"
                    >
                        <ExpandMoreIcon />
                    </ExpandMore>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <CardContent>
                        <Typography paragraph>
                            {movie.plot}
                        </Typography>
                    </CardContent>
                </Collapse>
            </Card>
        )
    }

    return (
       <>
              {style == CardStyle.VERTICAL && <CardVertical/>}
              {style == CardStyle.HORIZONTAL && <SimpleCard movie={movie}/>}
              {style == CardStyle.EXPANDED && <CardExpanded/>}
       </>


    )

}

export default MovieCard;