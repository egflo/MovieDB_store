    import {GetServerSideProps, GetServerSidePropsContext, GetStaticPaths, GetStaticProps} from "next";
import Box from "@mui/material/Box";
import {Direction, SortBy} from "../components/order/searchTypes";
import Toolbar from "../components/order/toolbar";
import Result from "../components/order/result";
import {Layout} from "../components/Layout";
import nookies from "nookies";
import React from "react";

function OrderPage() {
    const [term, setTerm] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [sort, setSort] = React.useState({sortBy: SortBy.ID, direction: Direction.DESC});
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
            <Toolbar term={term} setTerm={setTerm} limit={limit} setLimit={setLimit} sort={sort} setSort={setSort} page={page} setPage={setPage} total={total}/>
            <Result term={term} setTerm={setTerm} limit={limit} setLimit={setLimit} sort={sort} setSort={setSort} page={page} setPage={setPage} setTotal={setTotal}/>
        </Box>

    );
}

export interface SearchProps {
    term: string
    page: number
    limit: number
    sortBy: SortBy
    direction: Direction

}
export const getServerSideProps: GetServerSideProps = async (context) => {

    const page = context.query.hasOwnProperty('page') ? parseInt(context.query.page as string, 10) : 1;
    const limit = context.query.hasOwnProperty('limit') ? parseInt(context.query.limit as string, 10) : 10;
    const sortBy = context.query.hasOwnProperty('sortBy') ? context.query.sortBy : SortBy.ID;

    let object = {
        page: page,
        limit: limit,
        sortBy: sortBy,
        direction: Direction.DESC,
    } as SearchProps;

    try {
        const cookies = nookies.get(context);

        if (!cookies.token) {
            return {
                redirect: {
                    destination: '/',
                },
                props: {} as never,
            }
        }

        return {
            props: {
                searchProps: object,
                token: cookies.token
            }
        }

    }
    catch (e) {
        return {
            redirect: {
                destination: '/',
            },
            props: {} as never,
        }
    }
}

export default OrderPage;

OrderPage.getLayout = (page: any) => (
    <Layout>
        {page}
    </Layout>
);