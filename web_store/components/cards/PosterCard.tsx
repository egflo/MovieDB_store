
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import {useRouter} from "next/router";
import TheatersIcon from "@mui/icons-material/Theaters";
import {Movie} from "../../models/Movie";


function PosterCard({movie}: {movie: Movie}) {
    const router = useRouter();

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

        <Card sx={{ minWidth: 170, maxWidth: 170, height: 260,  cursor: 'pointer'}} onClick={() => handleCardClick(movie.movieId)}>
            {testURL(movie.poster) ? (

                <img src={movie.poster} alt={movie.title} draggable={false} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>


            ) : (
                <div style={{width: '100%', height: '100%', position: 'relative', padding:2}}>

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

    )

}

export default PosterCard;
