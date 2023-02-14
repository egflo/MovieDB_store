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


const API_URL_SEARCH: string = 'movie-service/movie/search/';
const fetcher = (url: string) => axiosInstance.get(url).then(response => response.data)

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

    let url = API_URL_SEARCH + term + `?page=${page-1}`  + "&limit=" + limit + "&sortBy=" + sort.sortBy + "&direction=" + sort.direction;
    console.log(url);

    if (genre.length > 0) {
        url += "&genres=" + genre;
    }
    if (tag.length > 0) {
        url += "&tags=" + tag;
    }
    const {data, error} = useSWR(url, fetcher)// {initialData: searchProps.movies})
    ///const {data, error} = useSWR(`${API_URL_SEARCH}${searchProps.term}?page=${page}&limit=${limit}&sortBy=${sort.sortBy}&direction=${sort.direction}`, fetcher);

    if(error) return <Box> <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'inherit'}}>Error loading data</Typography> </Box>
    if(!data) return <Box> <CircularProgress></CircularProgress> </Box>


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


