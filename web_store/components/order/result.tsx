import {axiosInstance} from "../../utils/firebase";
import useSWR from "swr";
import Box from "@mui/material/Box";
import {Sort} from "./searchTypes";
import {CircularProgress} from "@mui/material";
import Typography from "@mui/material/Typography";
import {Order} from "../../models/Order";
import {OrderCard} from "./OrderCard";
import useAuthContext from "../../hooks/useAuthContext";


const API_URL_SEARCH: string = `${process.env.NEXT_PUBLIC_ORDER_SERVICE_NAME}/user/`;

let fetcher = (url: string, token: string) => axiosInstance.get(url, {
    headers: {
        Authorization: `Bearer ${token}`
    } }).then((response: { data: any; }) => response.data)

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


export default function Result({term, setTerm, limit, setLimit, sort, setSort, page, setPage, setTotal}: ResultProps) {
    const auth = useAuthContext();

    let url = API_URL_SEARCH  + `?page=${page-1}`  + "&limit=" + limit + "&sortBy=" + sort.sortBy + "&direction=" + sort.direction;
    const {data, error} = useSWR([url, auth.token], fetcher)
    if(error) return <Box> <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'inherit'}}>Error loading data</Typography> </Box>
    if(!data) return <Box> <CircularProgress></CircularProgress> </Box>


    return (
        <Box className="container__result">

            <Box className="container-fluid">

                <Box className = "row flex-column gap-4">

                    {data.content.map((data: Order) => (

                        <Box key={data.id} className="col" >

                            <OrderCard order={data} />

                        </Box>

                    ))}

                </Box>

            </Box>

        </Box>
    );
}


