import {GetStaticPaths, GetStaticProps} from 'next'
import type {ParsedUrlQuery} from 'querystring'
import {CastDetails} from "../../models/CastDetails";
import {Layout} from "../../components/Layout";
import * as React from "react";
import {CardStyle} from "../../components/CardStyle";
import Typography from "@mui/material/Typography";
import {Backdrop, CardHeader} from "@mui/material";
import {useState} from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ScrollPagination from "../../components/ScrollPagination";
import {ContentType} from "../../components/ContentType";
import {ViewType} from "../../components/ViewType";
import {axiosInstance} from "../../utils/firebase";
import Header from "../../components/Header";
import Box from "@mui/material/Box";



const API_URL_MOVIES: string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/cast/`;
const API_URL_CAST: string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/cast/`;

export interface QParams extends ParsedUrlQuery {
    id?: string
}


function CastPage({data}: {data: CastDetails}) {
    const [open, setOpen] = useState(false);
    function testURL(url: string) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
    function handleClose() {
        setOpen(false);
    }
    function handleToggle() {
        setOpen(!open);
    }

    return (
        <>
            <div className="container__content">

                <div className={'hidden md:block w-screen h-[80vh] opacity-40 shadow'}>
                    <Box
                        style={
                            {
                                width: '100%',
                                height: '100%',
                                backgroundSize: 'cover',
                                backgroundImage: `url(/background.png)`,
                            }
                        }>
                    </Box>
                </div>

                <Box className="absolute bottom-0 w-full h-full bg-gradient-to-t from-black to-transparent" />


                <Box className="absolute w-full h-full pt-5">

                    <Box className="container__header py-2 md:px-4 pt-5 lg:px-4 xl:px-40">

                        <img
                            className="container__header__left"
                            style={
                                {
                                    boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                    borderRadius: '10px'

                                }
                            }
                            src={data.photo && testURL(data.photo) ? data.photo : "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"}
                            alt={data.name}
                        />

                        <Box className="container__info">

                            <div className="container__info__title">

                                <Typography variant={"h4"}>{data.name}</Typography>

                                {data.dob && data.dob !== "" && (

                                    <div className="hidden lg:block">
                                        <Typography>{data.dob}</Typography>
                                    </div>
                                )}

                            </div>

                            <div className="description-container px-2 md:px-0">

                                {data.birthplace && data.birthplace !== "" && (
                                    <div className="">
                                        <Typography className="description-title">Birth Place</Typography>
                                        <Typography className="description-text">{data.birthplace}</Typography>
                                    </div>

                                )}

                                <div onClick={() => {
                                    handleToggle()
                                }}>
                                    <Typography className="description-title">Biography</Typography>
                                    <Typography className="description-text sm:align-middle "
                                                style={{
                                                    textOverflow: 'ellipsis',
                                                    overflow: 'hidden',
                                                    width: '100%',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 7,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                    >{data.bio} </Typography>
                                    <button className="description-button">Read More</button>
                                </div>
                            </div>
                        </Box>
                    </Box>

                    <ScrollPagination path={API_URL_MOVIES + data.castId + "?sortBy=popularity&limit=50"}
                                      style={CardStyle.VERTICAL} type={ContentType.MOVIE} view={ViewType.VERTICAL}/>
                </Box>


            </div>

            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={open}
                onClick={handleClose}
            >
                <Card sx={{maxWidth: '85vw', maxHeight: '85vh', overflow: 'auto'}}>
                    <CardHeader>
                        <Typography variant={"h3"}>{"Biography"}</Typography>
                    </CardHeader>
                    <CardContent>
                        <Typography variant={"h4"}>{data.name}</Typography>
                        <Typography>{data.bio}</Typography>
                    </CardContent>
                </Card>

            </Backdrop>
        </>
    )
}

//https://stackoverflow.com/questions/65783199/error-getstaticpaths-is-required-for-dynamic-ssg-pages-and-is-missing-for-xxx
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}

export const getStaticProps: GetStaticProps<QParams> = async ({params}) => {
    const slug = params
    if (!slug) {
        return {
            notFound: true,
        }
    }
    const res = await axiosInstance.get(API_URL_CAST + slug.id)
    const data = await res.data

    return {
        props: {
            data
        }
    }
}
export default CastPage;

CastPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);