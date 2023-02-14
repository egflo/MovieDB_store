import {Page} from "../models/Page";
import {Movie} from "../models/Movie";
import * as React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import {CardActions} from "@mui/material";
import IconButton, {IconButtonProps} from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import StarIcon from '@mui/icons-material/Star';
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
import CartExpanded from "./actions/CartExpanded";
import Cart from "./actions/Cart";

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

            <Card sx={{ minWidth: 170, maxWidth: 170, onHover: 'pointer'}} onClick={() => handleCardClick(movie.movieId)}>
                {testURL(movie.poster) ? (

                    <CardMedia
                        component="img"
                        height="250"
                        image={testURL(movie.poster) ? movie.poster : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"}
                        alt={movie.title}
                    />
                ) : (
                        <div style = {{position:'relative', height:250}}>
                            <img
                                src={"/background.png"}
                                alt={movie.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    position: 'absolute',
                                    top: '0',
                                    left: '0',

                                }}
                            />

                            <Typography variant="h6" component="div" style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'white',
                                fontSize: '1.5rem',
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

            <Box className="content__card"

                 onClick={() => {handleCardClick(movie.movieId)}}>
                <img
                    src={movie.background}
                    alt={movie.title}
                    className="content__image"

                />

                <Box className="content__details"
                     style={{
                         color: 'white',
                         textShadow: "0 0 2px rgba(0,0,0,0.5)",
                         margin: "0 0 0 0",
                     }}>

                    <Typography variant="h5" className="content__title">{movie.title}</Typography>

                    <Box className="content__description" style={{height:'1.5rem'}}>
                        {!!movie.ratings.rottenTomatoes &&
                            (
                                <div style={{
                                    display: 'flex',
                                    gap: '5px',
                                }}> <img className="content__rating" style={{height:'100%', width:'100%', padding:'1px'}} src={"/Fresh.png"} alt={"tomato"}></img>
                                    <p className="content__rating__text">{movie.ratings.rottenTomatoes}%</p>
                                    <span className="separator">&bull;</span>
                                </div>
                            )

                        }

                        <Typography>{movie.year}</Typography>

                        <span className="separator">&bull;</span>

                        {movie.rated && movie.rated !== "NR" &&
                            <Typography>{movie.rated}</Typography>
                        }

                        <span className="separator">&bull;</span>

                        {movie.genres && movie.genres.length > 0 && (
                            <Typography>{movie.genres[0]}</Typography>
                        )}

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

                    <Cart itemId={movie.id} />
                </CardContent>

                <Divider sx={{
                    borderColor: 'grey.500',
                }}/>

                <CardActions disableSpacing sx={{color:'grey'}}>
                    <Favorite movie={movie} bookmark={null} selected={false}/>
                    <Share movie={movie}></Share>
                    <Rate movie={movie}></Rate>
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
              {style == CardStyle.HORIZONTAL && <CardHorizontal/>}
              {style == CardStyle.EXPANDED && <CardExpanded/>}
       </>


    )

}

export default MovieCard;