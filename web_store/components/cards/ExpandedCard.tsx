
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import TheatersIcon from "@mui/icons-material/Theaters";
import {Movie} from "../../models/Movie";
import Box from "@mui/material/Box";
import * as React from "react";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import {CardActions, Chip} from "@mui/material";
import Favorite from "../actions/Favorite";
import Rate from "../actions/Rate";
import Cart from "../actions/Cart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Collapse from "@mui/material/Collapse";
import IconButton, {IconButtonProps} from "@mui/material/IconButton";
import {styled} from "@mui/material/styles";

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


function ExpandedCard({movie}: {movie: Movie}) {
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

    return (
        <Card sx={{ width: 220, margin: 2}}>

            <CardMedia
                sx = {{height: 320}}
                onClick={() => handleCardClick(movie.movieId)}
                component="img"
                image= {testURL(movie.poster) ? movie.poster : 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'}
                alt={movie.title}
            />
            <CardContent>
                <Typography noWrap variant="h6" color="text.primary">
                    {movie.title}
                </Typography>

                <Box className="content__subtitle">
                    <Chip label={movie.year} size="small" className="bg-zinc-700" />

                    <Chip label={movie.rated ? movie.rated : "N/A"} size="small" className="bg-zinc-700" />

                    {movie.genres && movie.genres.length > 0 && (
                        <>
                            <Chip label={movie.genres[0]} size="small" className="bg-zinc-700" />
                        </>
                    )}

                </Box>

            </CardContent>


            <CardActions disableSpacing>
                <Favorite movie={movie}/>
                <Rate movie={movie}></Rate>
                <Cart movie={movie}/>
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

export default ExpandedCard;