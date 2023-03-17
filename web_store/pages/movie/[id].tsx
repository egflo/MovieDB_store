import {Movie} from "../../models/Movie";
import {GetServerSideProps, GetStaticPaths, GetStaticProps} from 'next'
import type {ParsedUrlQuery} from 'querystring'
import {Layout} from "../../components/Layout";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import Scroll from "../../components/Scroll";
import {CardStyle} from "../../components/CardStyle";
import ScrollPagination from "../../components/ScrollPagination";
import {Score} from "../../components/Score";
import Favorite from "../../components/actions/Favorite";
import Share from "../../components/actions/Share";
import Rate from "../../components/actions/Rate";
import {Chip} from "@mui/material";
import {useRouter} from "next/router";
import {Tag} from "../../models/Tag";
import {auth, axiosInstance} from "../../utils/firebase";
import {ViewType} from "../../components/ViewType";
import {ContentType} from "../../components/ContentType";
import {Paper} from "@mui/material";
import Box from "@mui/material/Box";
import Cart from "../../components/actions/Cart";
import Header from "../../components/Header";
import {cookies} from "next/headers";
import nookies from "nookies";
import {Direction, SortBy} from "../../components/search/searchTypes";
import {SearchProps} from "../search/[term]";
import axios, {AxiosRequestConfig} from "axios";
import Button from "@mui/material/Button";

export interface QParams extends ParsedUrlQuery {
    id?: string
}

const API_URL_ID: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/`;
const API_URL_SUGGEST: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/suggest/`;
const API_URL_REVIEWS: string = `/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/review/movie/`;


function MoviePage({data, token}: {data: Movie, token: string | undefined}) {
    const router = useRouter();

    function testURL(url: string) {
        if (url == null) {
            return false
        }
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }

    function testValue(value: any) {
        if (value == null) {
            return false
        }

        if (typeof value === 'string' || value instanceof String) {

            if (value.length === 0) {
                return false
            }
        }

        if (typeof value === 'number') {

            if (value <= 0) {
                return false
            }
        }

        return true
    }

    function onCastClick(id: string) {
        router.push(`/cast/${id}`);
    }


    function formatNumber(num?: number) {
        if (num) {
            return num.toFixed(0)
        }

        if (num == null) {
            return "N/A"
        }
        return num.toFixed(0)
    }

    function onGenreClick(id: string) {
        const params = {
            genres: id
        }
        router.push({
            pathname: '/search/all',
            query: params
        });
    }

    function onTagClick(tag: Tag) {
        const params = {
            tags: tag.id
        }
        router.push({
            pathname: '/search/all',
            query: params
        });
    }

    return (
        <Box
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',


            }}
        >

            <Box className="container__content">
                    <Box
                        className="content__background"
                        style={
                            {
                                width: '100%',
                                height: '100%',
                                backgroundSize: 'cover',
                                backgroundImage: `url(${testURL(data.background) ? data.background : "/background.png"})`,
                            }
                        }>
                    </Box>

                    <Box
                        className="content__background"
                        style={
                            {
                                width: '100%',
                                height: '100%',
                                backgroundSize: 'cover',
                                backdropFilter: 'blur(10px)',
                                backgroundColor: 'rgba(0,0,0,0.5)',

                            }
                        }>
                    </Box>


                    <Box className="container__header">

                        <Box className="container__header__left">
                            <img className="content__image"
                                 style={{width: '100%', height: '95%', objectFit: 'cover'}}
                                src={testURL(data.poster) ? data.poster : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"}
                                alt={data.title}
                            />

                        </Box>


                        <Box className="container__info">

                            <Box className="container__info__title">
                                <Typography variant="h4">
                                    {data.title}
                                </Typography>
                            </Box>

                            <Box className="content__subtitle">
                                <Typography variant="subtitle1" className="content__subtitle__text">
                                    {data.year}
                                </Typography>

                                <span className="separator">&bull;</span>

                                <Typography variant="subtitle1" className="content__subtitle__text">
                                    {data.rated ? data.rated : "N/A"}
                                </Typography>

                                <span className="separator">&bull;</span>

                                <Typography variant="subtitle1" className="content__subtitle__text">
                                    {data.runtime} min
                                </Typography>
                            </Box>

                            {data.genres &&
                                <Box className="content__genres">
                                    {data.genres.map((genre, index) => (
                                        <Chip key={index}
                                              onClick={() => onGenreClick(genre)}
                                              sx={{
                                                  "&:hover": {
                                                      backgroundColor: "rgba(100,100,100,0.4)",
                                                  },
                                                  cursor: 'pointer',
                                              }}
                                              color="primary" label={genre}></Chip>
                                    ))}
                                </Box>
                            }


                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                    alignContent: 'flex-start',
                                    gap: '5px'
                                }}>


                                {data.ratings &&

                                    <Score score={data.ratings.rating}></Score>
                                }

                                <Box className="content__action_items">

                                    <Favorite movie={data}></Favorite>
                                    <Share movie={data}></Share>
                                    <Rate movie={data}></Rate>
                                </Box>
                            </Box>


                            {data.ratings &&

                                <Box style={{
                                    display:'flex',
                                    flexDirection:'row',
                                    flexWrap:'wrap',
                                    alignItems:'center',
                                    alignContent:'flex-start',
                                    gap:'15px'
                                }}>
                                    {testValue(data.ratings.imdb)  &&
                                        <Box className="container__ratings">
                                            <img className="content__rating" style={{padding:0}} src={"/imdb.png"} alt={"IMDB"}></img>
                                            <Typography className="content__rating__text">{data.ratings.imdb}
                                                <span style={{color:'grey', fontSize: '0.8rem', margin:0}}> / 10 </span>
                                            </Typography>
                                        </Box>
                                    }

                                    {testValue(data.ratings.metacritic)  &&
                                        <Box className="container__ratings">
                                            <img className="content__rating" style={{height:30}} src={"/metacritic.png"} alt={"meta"}></img>
                                            <Typography
                                            className="content__rating__text">{formatNumber(data.ratings.metacritic)}</Typography></Box>
                                    }

                                    {data.ratings.rottenTomatoesStatus &&
                                        <Box className="container__ratings">
                                            <img className="content__rating" style={{height:30}} src={"/Fresh.png"} alt={"tomato"}></img>
                                            <Typography className="content__rating__text">{formatNumber(data.ratings.rottenTomatoes)}%</Typography></Box>
                                    }

                                    {data.ratings.rottenTomatoesAudienceStatus &&
                                        <Box className="container__ratings">
                                            <img className="content__rating" style={{height:32}} src={'/' + data.ratings.rottenTomatoesAudienceStatus + '.png'} alt={"tomato"}></img>
                                            <Typography className="content__rating__text">{formatNumber(data.ratings.rottenTomatoesAudience)}%
                                            </Typography>
                                        </Box>
                                    }

                                </Box>
                            }

                            <Box className="description-container">
                                <Box className="description-item-container" sx={{width:'100%'}}>
                                    <Typography className="description-title">Overview</Typography>
                                    <Typography className="description-text">{data.plot}</Typography>
                                </Box>
                                <Box className="description-item-container">
                                    <Typography className="description-title">Director</Typography>
                                    <Typography className="description-text">{data.director}</Typography>
                                </Box>

                            </Box>

                            <Box className="content__tags">
                                {data.tags.map((tag, index) => (
                                    <Chip key={index}
                                          onClick={() => onTagClick(tag)}
                                          sx={{
                                              "&:hover": {
                                                  backgroundColor: "rgba(100,100,100,0.4)",
                                              },
                                              cursor: 'pointer',
                                          }}
                                          color="primary" label={tag.name}></Chip>
                                ))}
                            </Box>

                        </Box>
                    </Box>

                </Box>

            <Box className="blur-line"></Box>

            {data.cast && data.cast.length > 0 &&
                <Scroll title={"Cast & Crew"}>
                    <Box className="container-fluid">
                        <Box className="row flex-row flex-nowrap">
                            {data.cast.map((cast, index) => (

                                <Box key={index} className="col">

                                    <Card sx={{ width: 180, height: 270, cursor: 'pointer' }}
                                          onClick={() => onCastClick(cast.id)} >
                                        <CardMedia
                                            component="img"
                                            alt={cast.name}
                                            height="150"
                                            image={testURL(cast.photo) ? cast.photo: 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'}
                                        />
                                        <CardContent>
                                            <Typography gutterBottom variant="h6" component="div" sx={
                                                {
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 1,
                                                    WebkitBoxOrient: 'vertical',

                                                }}>
                                                {cast.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {cast.characters.join('/')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Box>
                            ))}
                        </Box>

                    </Box>
                </Scroll>
            }

            <ScrollPagination path={API_URL_REVIEWS + data.movieId + '?sortBy=created'} style={CardStyle.VERTICAL} type={ContentType.REVIEW} view={ViewType.HORIZONTAL} title={"Reviews"} token={token}/>

            <ScrollPagination path={API_URL_SUGGEST + data.movieId + '?sortBy=popularity'} style={CardStyle.VERTICAL} type={ContentType.MOVIE} view={ViewType.HORIZONTAL} title={"Related"}/>

            <Header title={"Description"} />

            <Box
                 sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: '10px',
                    padding: 1,
                 }}
            >
                <Paper elevation={1}>
                    <div className="description-item">
                        <Typography className="description-title">Writer(s)</Typography>
                        <Typography className="description-text">{data.writer}</Typography>
                    </div>
                </Paper>

                <Paper elevation={1}>
                    <div className="description-item">
                        <Typography className="description-title">Production</Typography>
                        <Typography className="description-text">{data.production}</Typography>
                    </div>
                </Paper>

                <Paper elevation={1}>
                    <div className="description-item">
                        <Typography className="description-title">Country</Typography>
                        <Typography className="description-text">{data.country}</Typography>
                    </div>
                </Paper>

                <Paper elevation={1}>
                    <div className="description-item">
                        <Typography className="description-title">Language(s)</Typography>
                        <Typography className="description-text">{data.language}</Typography>
                    </div>
                </Paper>

                <Paper elevation={1}>
                    <div className="description-item">
                        <Typography className="description-title">Box Office</Typography>
                        <Typography className="description-text">{data.boxOffice}</Typography>
                    </div>
                </Paper>
            </Box>


            {data.item &&
                <Box className="buy-button-container"
                     sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 1, position: 'fixed', bottom: 50, width: '100%', zIndex: 1000}}>
                    <Cart item={data.item} />
                </Box>
            }

        </Box>
    )
}


export const getServerSideProps: GetServerSideProps = async (context) => {

    // @ts-ignore
    const slug = context.params['id'];

    if (!slug) {

        return {
            notFound: true,
        }
    }

    const cookie = nookies.get(context);
    const token = cookie.token;

    //Add authorization header to axios if token is present else remove it
    const axiosInstance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL,
    } as AxiosRequestConfig);

    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    }

    let fetcher = (url: string) => axiosInstance.get(url)
        .then((response: { data: any; }) => response.data)
        .catch((error: any) => {
            console.log(error)
            return null
        })


    console.log(API_URL_ID + slug)

    const data = await fetcher(API_URL_ID + slug)

    if (!data) {
            return {
                notFound: true,
            }
    }

    return {
        props: {
            data: data,
            token: token
        }
    }
}





//https://stackoverflow.com/questions/65783199/error-getstaticpaths-is-required-for-dynamic-ssg-pages-and-is-missing-for-xxx

export default MoviePage;


MoviePage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);