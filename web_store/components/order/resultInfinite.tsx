import {axiosInstance} from "../../utils/firebase";
import Box from "@mui/material/Box";
import {Movie} from "../../models/Movie";
import {Sort} from "./searchTypes";
import {CircularProgress, Pagination} from "@mui/material";
import Typography from "@mui/material/Typography";
import useAuthContext from "../../hooks/useAuthContext";
import {MutableRefObject, useEffect, useRef, useState} from "react";
import useOnScreen from "../../hooks/useOnScreen";
import useSWRInfinite from "swr/infinite";
import {OrderCard} from "./OrderCard";
import {Order} from "../../models/Order";


const API_URL_SEARCH: string = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/user/`;


type ResultProps = {
    term: string;
    setTerm: (term: string) => void;

    limit: number;
    setLimit: (limit: number) => void;

    sort: Sort;
    setSort: (sort: Sort) => void;

    page: number;
    setPage: (page: number) => void;

    setTotal: (total: number) => void;
}



let fetcher = (path: string, token: string | undefined) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return axiosInstance.get(path).then(res => res.data.content)
}

const PAGE_SIZE = 10;
const getKey = (index: any, previousPageData: any, path: any, pageSize: any) => {
    if (previousPageData && !previousPageData.length) return null // reached the end
    return `${path}&limit=${PAGE_SIZE}&page=${index}`
}


export default function ResultInfinite({limit, setLimit, sort, setSort, term, setTotal}: ResultProps) {
    let ref = useRef() as MutableRefObject<HTMLDivElement>;
    const isVisible = useOnScreen(ref);
    const auth = useAuthContext();

    const[show, setShow] = useState(false);
    const [page, setPage] = useState(0);
    const [last, setLast] = useState(false);

    let path = API_URL_SEARCH + term + "?sortBy=" + sort.sortBy + "&direction=" + sort.direction;

    if(term !== "") {

        path = API_URL_SEARCH + term + "?sortBy=" + sort.sortBy + "&direction=" + sort.direction + "&term=" + term ;
    }


    const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite(
        (...args) => getKey(...args, path, PAGE_SIZE),
        (...args) => fetcher(...args, auth.token ? auth.token : undefined),
        {
            revalidateOnFocus: false,
        }
    )

    const items = data ? [].concat(...data) : [];
    const isLoadingInitialData = !data && !error;
    const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);
    const isRefreshing = isValidating && data && data.length === size;

    useEffect(() => {
        if (data) {
            setTotal(data[0].totalElements);
        }

    }, [sort, term])

    useEffect(() => {
        if (isVisible && !isReachingEnd && !isRefreshing) {
            setSize(size + 1)
        }
    }, [isVisible, isRefreshing])


    return (
        <div>
            <Box className="container-fluid ">
                {isEmpty ?
                    <Box className="row flex-row flex-wrap g-2">
                        <Box className="col" >
                            <Typography variant="h6" component="h6" gutterBottom>
                                No Content
                            </Typography>
                        </Box>
                    </Box> : null}

                <Box className="row flex-row flex-wrap justify-content-md-center gap-4">
                    {items.map((order: Order, index: number) => (
                        <Box className="col-md-7 col-sm-6 col-xs-12"
                             key={index}>
                            <OrderCard order={order}/>
                        </Box>
                    ))}

                </Box>

            </Box>


            <Box ref={ref} sx={{border: "1px solid blue"}}>
                {isLoadingMore ? <CircularProgress/> : isReachingEnd ? 'Done' : ''}
            </Box>
        </div>

);
}


