
import {CardStyle} from "../CardStyle";
import Box from "@mui/material/Box";
import {useSWRConfig} from "swr";
import {fetchMovies} from "../../api/fetcher";
import useSWRInfinite from "swr/infinite";
import {Movie} from "../../models/Movie";
import {Page} from "../../models/Page";
import Typography from "@mui/material/Typography";
import MovieCard from "../../components/MovieCard";
import React, {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import {SimpleCard} from "../cards/SimpleCard";
import {Bookmark} from "../../models/Bookmark";
import {ProgressBar} from "react-bootstrap";
import {CircularProgress} from "@mui/material";
import {useBookmarkContext} from "../../contexts/BookmarkContext";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import VerticalCard from "../cards/VerticalCard";


const BOOKMARKS_API = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/bookmarks/`;
const fetcher = (url: string, page: number) => fetchMovies(url, page, 10);

export default function Bookmarks() {

    const {bookmarks, addBookmark, removeBookmark, getBookmark} = useBookmarkContext();


    const ref = React.useRef(null);
    const { data, error, mutate, size, setSize, isValidating } = useSWRInfinite<Page<Movie>>(
        (index) => `${index}`, // Unique key for each page
        (index) => fetcher(BOOKMARKS_API, index)
    );

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setSize(size + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [setSize, size]);

    const onBookmarkAdded = (id: string) => {
        console.log("Bookmark Added, id: ", id);
        // update the local data immediately and revalidate (refetch)
        // @ts-ignore
        mutate();

    };

    const onBookmarkRemoved = (id: string) => {
        console.log("Bookmark Removed, id: ", id);
        //Update the cache
        // @ts-ignore
        mutate();
    }

    if (error) return <div>Error loading</div>;
    if (!data) return <CircularProgress />;

    const isLoadingInitialData = !data && !error;
    const isEmpty = data.every((page) => page.content.length === 0);
    const items = data.map((page) => page.content).flat();
    const isLoadingMore =
        isLoadingInitialData ||
        (size > 0 && data && typeof data[size - 1] === "undefined");

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center'}}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: 4,
                    gap: 10,
                }}
            >
                <Box className="container-fluid">
                    {isEmpty ?
                        <Box className="row flex-row flex-wrap g-2">
                            <Box className="col">
                                <Typography variant="h6" component="h6" gutterBottom>
                                    No Content
                                </Typography>
                            </Box>
                        </Box> : null}

                    <TransitionGroup
                        className="row flex-row flex-wrap g-4 justify-content-center"
                    >
                        {bookmarks.map((item, index) => (
                            <CSSTransition key={item.id} timeout={500} classNames="bookmark">
                                <Box key={item.id} className="col flex-grow-0">
                                    <SimpleCard
                                        movie={item.movie}
                                        onBookmarkAdded={onBookmarkAdded}
                                        onBookmarkRemoved={onBookmarkRemoved}
                                    />

                                </Box>
                            </CSSTransition>
                        ))}
                    </TransitionGroup>

                </Box>

                <Button
                    variant="contained"
                    onClick={() => setSize(size + 1)}
                    disabled={isValidating || data[data.length - 1]?.last}
                >
                    {isValidating ? 'Loading...' : 'Load More'}
                </Button>
            </div>


        </Box>

    );


};
