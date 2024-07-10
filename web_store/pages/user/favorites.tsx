
import {Layout} from "../../components/Layout";
import {CardStyle} from "../../components/CardStyle";
import {ContentType} from "../../components/ContentType";
import {ViewType} from "../../components/ViewType";
import Box from "@mui/material/Box";
import {GetServerSideProps, GetServerSidePropsContext} from "next";
import nookies from "nookies";
import ScrollPagination from "../../components/ScrollPagination";
import {useSWRConfig} from "swr";
import {fetchMovies} from "../../api/fetcher";
import useSWRInfinite from "swr/infinite";
import {Movie} from "../../models/Movie";
import {Page} from "../../models/Page";
import Typography from "@mui/material/Typography";
import MovieCard from "../../components/MovieCard";
import React, {useEffect} from "react";
import {CircularProgress} from "@mui/material";
import Button from "@mui/material/Button";
import withAuth from "../../components/withAuth";
import Bookmarks from "../../components/user/Bookmarks";




export default function FavoritePage(props: any) {
    const ProtectedFavorite = withAuth(Bookmarks);


    return (

        <ProtectedFavorite/>

    );


};

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
    try {

        const cookies = nookies.get(context);

        return {
            props: {
                token: cookies.token
            }
        }

    } catch (e) {
        return {
            redirect: {
                destination: '/',
            },
            props: {} as never,
        }
    }
}

FavoritePage.getLayout = (page: any) => (
    <Layout>
    {page}
    </Layout>
);