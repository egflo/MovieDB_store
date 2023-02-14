import {GetServerSideProps, GetStaticPaths, GetStaticProps} from "next";
import {QParams} from "../cast/[id]";
import {Movie} from "../../models/Movie";
import {Layout} from "../../components/Layout";
import * as React from 'react';
import Toolbar from "../../components/search/toolbar";
import Result from "../../components/search/result";
import {Direction, SortBy} from "../../components/search/searchTypes";
import Box from "@mui/material/Box";



function SearchPage({searchProps}: {searchProps: SearchProps}) {

    const [page, setPage] = React.useState(searchProps.page);
    const [limit, setLimit] = React.useState(searchProps.limit);
    const [sort, setSort] = React.useState({sortBy: searchProps.sortBy, direction: searchProps.direction});
    const [genre, setGenre] = React.useState(searchProps.genres);
    const [tag, setTag] = React.useState(searchProps.tags);
    const [total, setTotal] = React.useState(100);

    console.log("Search Props: ", searchProps);


    return (
        <Box
            sx={{
                 display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                    width: '100vw',
                }}
        >
            <Toolbar limit={limit} setLimit={setLimit} sort={sort} setSort={setSort} page={page} setPage={setPage} total={total}/>
            <Result limit={limit} setLimit={setLimit} sort={sort} setSort={setSort} page={page} setPage={setPage} term={searchProps.term} genre={genre} tag={tag} setTotal={setTotal}/>
        </Box>

    );
}

//https://stackoverflow.com/questions/65783199/error-getstaticpaths-is-required-for-dynamic-ssg-pages-and-is-missing-for-xxx

/*
export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {

    return {
        paths: [], //indicates that no page needs be created at build time
        fallback: 'blocking' //indicates the type of fallback
    }
}
export const getStaticProps: GetStaticProps<QParams> = async ({params}) => {
    console.log(params);
    const slug = params
    if (!slug) {
        return {
            notFound: true,
        }
    }
    const res = await fetch(API_URL_SEARCH + slug.term)
    const data = await res.json()

    return {
        props: {
            slug,
        }
    }
}

export const getServersideProps: GetServerSideProps = async (context) => {
    console.log("getServersideProps");
    const page = context.query.hasOwnProperty('page') ? parseInt(context.query.page, 10) : 1;

    console.info(context.params.query, page, start);


    const { slug } = context.query;
    return {
        props: {
            term: slug
        }
    }
}

 */

export interface SearchProps {
    term: string
    page: number
    limit: number
    sortBy: SortBy
    direction: Direction
    genres: String
    tags: String
}
export const getServerSideProps: GetServerSideProps = async (context) => {


    const page = context.query.hasOwnProperty('page') ? parseInt(context.query.page as string, 10) : 1;
    const limit = context.query.hasOwnProperty('limit') ? parseInt(context.query.limit as string, 10) : 10;
    const sortBy = context.query.hasOwnProperty('sortBy') ? context.query.sortBy : SortBy.RATING;
    const genres = context.query.hasOwnProperty('genres') ? context.query.genres : "";
    const tags = context.query.hasOwnProperty('tags') ? context.query.tags : "";


    let object = {
        term: context.query.term,
        page: page,
        limit: limit,
        sortBy: sortBy,
        direction: Direction.DESC,
        genres: genres,
        tags: tags
    } as SearchProps;

    return {
        props: {
            searchProps: object,
        }
    }
}


export default SearchPage;


SearchPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);