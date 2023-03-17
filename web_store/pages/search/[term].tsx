import {GetServerSideProps, GetStaticPaths, GetStaticProps} from "next";
import {Layout} from "../../components/Layout";
import Toolbar from "../../components/search/toolbar";
import Result from "../../components/search/result";
import {Direction, SortBy} from "../../components/search/searchTypes";
import Box from "@mui/material/Box";
import nookies from "nookies";
import React from "react";



function SearchPage({searchProps}: {searchProps: SearchProps}) {

    const [page, setPage] = React.useState(searchProps.page);
    const [limit, setLimit] = React.useState(searchProps.limit);
    const [sort, setSort] = React.useState({sortBy: searchProps.sortBy, direction: searchProps.direction});
    const [genre, setGenre] = React.useState(searchProps.genres);
    const [tag, setTag] = React.useState(searchProps.tags);
    const [total, setTotal] = React.useState(100);


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