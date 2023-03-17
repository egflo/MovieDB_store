import {axiosInstance} from "../../utils/firebase";
import useSWR from "swr";
import Box from "@mui/material/Box";
import {Movie} from "../../models/Movie";
import MovieCard from "../MovieCard";
import {CardStyle} from "../CardStyle";
import * as React from "react";
import {useTheme} from "@mui/material/styles";
import {Sort} from "./searchTypes";
import {CircularProgress} from "@mui/material";
import Typography from "@mui/material/Typography";
import useAuthContext from "../../hooks/useAuthContext";
import axios from "axios";


const API_URL_SEARCH: string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/search/`;

const fetcher = (url: string, token: string | undefined) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    return axiosInstance.get(url).then(res => res.data)

}

type ResultProps = {
    limit: number;
    setLimit: (limit: number) => void;

    sort: Sort;
    setSort: (sort: Sort) => void;

    page: number;
    setPage: (page: number) => void;

    term: String;
    genre: String;
    tag: String;

    setTotal: (total: number) => void;
}


export default function Result({limit, setLimit, sort, setSort, page, setPage, term, genre, tag, setTotal}: ResultProps) {
    const theme = useTheme()
    const auth = useAuthContext();

    let url = API_URL_SEARCH + term + `?page=${page-1}`  + "&limit=" + limit + "&sortBy=" + sort.sortBy + "&direction=" + sort.direction;

    if (genre.length > 0) {
        url += "&genres=" + genre;
    }
    if (tag.length > 0) {
        url += "&tags=" + tag;
    }
    const {data, error} = useSWR([url,auth.token], fetcher)
    if(error) return <Box> <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'inherit'}}>Error loading data</Typography> </Box>
    if(!data) return <Box> <CircularProgress></CircularProgress> </Box>
    //setTotal(data.numberOfElements);

    return (
        <Box className="container__result"
             sx={{
                 backgroundColor: theme.palette.background.default,
             }}>
            <Box className="container-fluid">
                <Box className = "row flex-row">
                    {data.content.map((movie: Movie) => (

                        <Box key={movie.id} className="col">

                            <MovieCard style={CardStyle.EXPANDED} movie={movie}></MovieCard>

                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}


