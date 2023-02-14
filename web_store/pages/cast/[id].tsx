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


export interface QParams extends ParsedUrlQuery {
    id?: string
}

const API_URL_MOVIES: string = 'movie-service/movie/cast/';

function CastPage({data}: {data: CastDetails}) {
    const [open, setOpen] = useState(false);
    function testURL(url: string) {
        return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
    }
    function handleClose() {
        setOpen(false);
    }
    function handleToggle() {
        console.log("handleToggle");
        setOpen(!open);
    }

    return (
        <>
            <Box className="container__content">

                <Box
                    className="content__background"
                    style={
                        {
                            width: '100%',
                            height: '100%',
                            backgroundSize: 'cover',
                            backdropFilter: 'blur(1.5rem)',
                            backgroundImage: `url(${"/background.png"})`,

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
                            backdropFilter: 'blur(1.5rem)',
                            backgroundColor: 'rgba(0,0,0,0.5)',

                        }
                    }>
                </Box>


                <Box className="container__header">
                    <img
                        className="content__image"
                        style={
                            {

                                width: '300px',
                                height: '450px',
                                boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                                borderRadius: '10px'

                            }
                        }
                        src={data.photo}
                        alt={data.name}
                    />

                    <Box className="container__info">

                        <div className="container__info__title">
                            <Typography variant={"h3"}>{data.name}</Typography>
                        </div>

                        <div className="content__subtitle">
                            <Typography>{data.dob}</Typography>
                        </div>

                        <div className="description-container">

                            <div className="description">
                                <Typography className="description-title">Birth Place</Typography>
                                <Typography className="description-text">{data.birthplace}</Typography>
                            </div>

                            <div className="description" onClick={() => {handleToggle()}}>
                                <Typography className="description-title">Biography</Typography>
                                <Typography className="description-text"
                                      style={{
                                          textOverflow: 'ellipsis',
                                          overflow: 'hidden',
                                          width: '100%',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 9,
                                          WebkitBoxOrient: 'vertical',
                                          }}
                                >{data.bio} </Typography>
                            </div>
                        </div>
                    </Box>
                </Box>

            </Box>

            <Header title={"Filmography"}/>

            <ScrollPagination path={API_URL_MOVIES + data.castId + "?sortBy=popularity"}
                              style={CardStyle.VERTICAL} type={ContentType.MOVIE} view={ViewType.VERTICAL}/>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
                onClick={handleClose}
            >
                <Card sx={{ maxWidth: '85vw' }}>
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
    const res = await axiosInstance.get("movie-service/cast/" + slug.id)
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