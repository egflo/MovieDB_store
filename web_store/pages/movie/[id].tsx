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
import {ViewType} from "../../components/ViewType";
import {ContentType} from "../../components/ContentType";
import Box from "@mui/material/Box";
import Cart from "../../components/actions/Cart";
import nookies from "nookies";

import axios, {AxiosRequestConfig} from "axios";


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
        <Box className="bg-black opacity-100">

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



                    <Box className="absolute bottom-0 w-full h-full bg-gradient-to-t from-zinc-900 to-transparent" />


                    <Box className="absolute w-full h-full">

                        <Box className="container__header px-3 md:px-5 pt-5 lg:px-4 xl:px-40 ">

                            <Box className="container__header__left">

                                <img className="content__image"
                                     style={{width: '100%', height: '95%', objectFit: 'cover'}}
                                     src={testURL(data.poster) ? data.poster : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"}
                                     alt={data.title}
                                />

                            </Box>

                            <Box className="container__info">


                                <Box className="container__info__title">
                                    <Typography variant="h5">
                                        {data.title}
                                    </Typography>
                                </Box>

                                <Box className="content__subtitle">
                                    <Chip label={data.year} size="small" className="bg-zinc-700" />


                                    <Chip label={data.rated ? data.rated : "N/A"} size="small" className="bg-zinc-700" />


                                    <Chip label={data.runtime ? data.runtime + " min" : "N/A"} size="small" className="bg-zinc-700" />
                                </Box>


                                <Box

                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        alignContent: 'flex-start',
                                        gap: '5px',
                                    }}>


                                    {data.ratings &&

                                        <Score score={data.ratings.rating}></Score>
                                    }

                                    <Box className="content__action_items ">

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
                                        gap:'5px'
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
                                            <Box className="container__ratings hidden md:visible lg:visible xl:visible">
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
                                    <Box className="description-item-container "
                                         sx={{width:'100%'}}>
                                        <Typography className="description-title">Overview</Typography>
                                        <Typography className="description-text text-white" variant={"body2"}>{data.plot}</Typography>
                                    </Box>
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

                            </Box>

                        </Box>

                        <Box className="md:grid grid-cols-5 px-2 lg:px-20 xl:px-40" >

                            <Box className="col-span-4 p-2  flex flex-col gap-2">

                                {data.cast && data.cast.length > 0 &&
                                    <Scroll title={"Cast & Crew"}>
                                        <Box className="container-fluid">
                                            <Box className="row flex-row flex-nowrap gap-3">
                                                {data.cast.map((cast, index) => (

                                                    <Box key={index} className="col p-0">

                                                        <Card sx={{width: 150, height: 200, cursor: 'pointer'}}
                                                              onClick={() => onCastClick(cast.id)} >
                                                            <CardMedia
                                                                sx={{height: 120}}
                                                                component="img"
                                                                alt={cast.name}
                                                                height="120"
                                                                image={testURL(cast.photo) ? cast.photo: 'https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg'}
                                                            />
                                                            <CardContent>
                                                                <Typography variant={"inherit"}  component="div" sx={
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

                                <ScrollPagination path={API_URL_SUGGEST + data.movieId + '?sortBy=popularity'} style={CardStyle.HORIZONTAL} type={ContentType.MOVIE} view={ViewType.HORIZONTAL} title={"Related"}/>


                            </Box >

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: '5px',
                                    padding: 1,
                                }}
                            >
                                    <Typography className="invisible">Additional Information</Typography>

                                    <div className="description-item">
                                        <Typography className="description-title">Director</Typography>
                                        <Typography className="description-text" variant={"body2"}>{data.director}</Typography>
                                    </div>

                                    <div className="description-item">
                                        <Typography className="description-title">Writer(s)</Typography>
                                        <Typography className="description-text" variant={"body2"}>{data.writer}</Typography>
                                    </div>

                                    <div className="description-item">
                                        <Typography className="description-title">Production</Typography>
                                        <Typography className="description-text" variant={"body2"}>{data.production}</Typography>
                                    </div>

                                    <div className="description-item">
                                        <Typography className="description-title">Country</Typography>
                                        <Typography className="description-text" variant={"body2"}>{data.country}</Typography>
                                    </div>

                                    <div className="description-item">
                                        <Typography className="description-title">Language(s)</Typography>
                                        <Typography className="description-text" variant={"body2"}>{data.language}</Typography>
                                    </div>

                                    <div className="description-item">
                                        <Typography className="description-title">Box Office</Typography>
                                        <Typography className="description-text" variant={"body2"}>{data.boxOffice}</Typography>
                                    </div>


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



    const data = await fetcher(API_URL_ID + slug)

    if (!data) {
            return {
                notFound: true,
            }
    }

    return {
        props: {
            data: data,
            token: token ? token : null
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