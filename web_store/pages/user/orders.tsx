    import {GetServerSideProps, GetServerSidePropsContext, GetStaticPaths, GetStaticProps} from "next";
import Box from "@mui/material/Box";
import {Direction, SortBy} from "../../components/order/searchTypes";
import Toolbar from "../../components/order/toolbar";
import Result from "../../components/order/result";
import {Layout} from "../../components/Layout";
import nookies from "nookies";
import React from "react";
import ScrollPagination from "../../components/ScrollPagination";
    import {set} from "@firebase/database";
import ResultInfinite from "../../components/order/resultInfinite";
    import FormControl from "@mui/material/FormControl";
    import Button from "@mui/material/Button";

function OrderPage() {
    const ref = React.useRef(null);
    const [value, setValue] = React.useState('');
    const [term, setTerm] = React.useState('');
    const [page, setPage] = React.useState(1);
    const [limit, setLimit] = React.useState(10);
    const [sort, setSort] = React.useState({sortBy: SortBy.ID, direction: Direction.DESC});
    const [valueSort, setValueSort] = React.useState(0);
    const [total, setTotal] = React.useState(0);

    function processSort(value: number) {
        switch (value as number) {
            case 0:
                setValueSort(0)
                setSort({sortBy: SortBy.ID, direction: Direction.DESC});
                break;
            case 1:
                setValueSort(1)
                setSort({sortBy: SortBy.CREATED, direction: Direction.DESC});
                break;
            case 2:
                setValueSort(2)
                setSort({sortBy: SortBy.CREATED, direction: Direction.ASC});
                break;
            default:
                setValueSort(0)
                setSort({sortBy: SortBy.ID, direction: Direction.DESC});
        }
    }

    const onSearch = () => {
        setTerm(value);
        setPage(0);
    }

    return (
        <Box>
            <Box className=" flex flex-row gap-2 pl-2 pr-2 justify-between pt-1 pb-2">
                <FormControl>
                    <Box className="flex flex-row gap-2">

                        <input
                            className={"text-white rounded-md placeholder-gray-500 bg-gray-850 p-1"}
                            type="text"
                            placeholder="Search"
                            onChange={(event) => {
                                setValue(event.target.value);
                            }}
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                onSearch();
                            }}>
                            Search
                        </Button>
                    </Box>

                </FormControl>

                <FormControl>
                    <select
                        className={"text-white rounded-md placeholder-gray-500 bg-gray-850 p-2 "}
                        value={valueSort}
                        onChange={(event) => {
                            processSort(Number(event.target.value));
                        }}
                    >
                        <option value={0}>ID</option>
                        <option value={1}>Created Desc</option>
                        <option value={2}>Created Asc</option>
                    </select>
                </FormControl>
            </Box>

            <ResultInfinite term={term} page={page} limit={limit}
                            setTotal={setTotal} setLimit={setLimit} setPage={setPage} setSort={setSort} setTerm={setTerm} sort={sort}/>
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