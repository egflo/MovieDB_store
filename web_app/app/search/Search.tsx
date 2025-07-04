'use client';
import {useRouter, useSearchParams} from "next/navigation";
import React, {forwardRef, useEffect, useState} from "react";
import useSWR from 'swr';
import {Movie} from "@/lib/models/Movie";
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import {Filter1Outlined} from "@mui/icons-material";
import {Chip} from "@mui/material";
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Button from '@mui/material/Button';
import { FixedSizeList as List } from "react-window";
import {Tag} from "@/lib/models/Tag";
import SubSection from "@/app/ui/SubSection";

function ResultItem({movie}: { movie: Movie }) {
    const router = useRouter();
    const imageUrl = movie.poster;
    const [isImageValid, setIsImageValid] = useState<boolean>(true);

    useEffect(() => {
        if (!imageUrl) {
            setIsImageValid(false);
            return;
        }
        let isMounted = true;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            if (isMounted) setIsImageValid(true);
        };
        img.onerror = () => {
            if (isMounted) setIsImageValid(false);
        };

        return () => {
            isMounted = false;
        };
    }, [imageUrl]);

    return (
        <div
            onClick={() => router.push(`/movie/${movie.movieId}`)}
            className={"flex flex-row gap-2 justify-start  rounded-lg   bg-gray-900 md:h-[240px]"}
        >
            <div
                className={`hidden md:flex items-center justify-center rounded-lg 
               bg-gray-800 cursor-pointer text-white font-bold text-xl overflow-hidden  sm:min-w-[180px] md:min-w-[180px] sm:max-w-[180px] md:max-w-[180px] `}
            >
                {isImageValid && imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'top' }}

                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <LocalMoviesIcon fontSize={"large"} />
                    </div>
                )}
            </div>



            <div className=" flex flex-col  w-full h-full">

                <div
                    className={`flex items-center justify-center rounded-lg h-44
               bg-gray-800 cursor-pointer text-white font-bold text-xl overflow-hidden md:hidden `}
                >
                    {isImageValid && imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full flex items-center justify-center bg-gray-800">
                            <LocalMoviesIcon fontSize={"large"} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 p-2 h-full">

                    <div className="flex flex-row gap-1 items-center pl-2">
                        <h1 className="text-lg font-bold text-white">{movie.title}</h1>
                        <span className="text-sm font-semibold text-gray-400">{movie.year}</span>
                    </div>

                    {movie.genres &&
                        <div className="flex flex-row  ">
                            {movie.genres.map((genre:string, index: number) => (
                                <div key={index}>
                                    <Chip
                                        className={'text-sm font-semibold bg-gray-900'}
                                        onClick={() =>  router.push(`/search/?genres=${genre}`)}
                                        sx={{
                                            backgroundColor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            "&:hover": {
                                                backgroundColor: "rgba(100,100,100,0.4)",
                                            },
                                            cursor: 'pointer',
                                        }}
                                        label={genre}
                                    />
                                </div>
                            ))}
                        </div>
                    }

                    <p className="text-sm text-white pl-2">
                        {movie.plot}
                    </p>

                    <div className={"hidden md:flex flex-col gap-2 w-full "}>
                        {movie.tags &&
                            <div className="flex flex-wrap ">
                                {movie.tags.map((tag:Tag, index: number) => (
                                    <div key={index}>
                                        <Chip
                                            className={'text-sm font-semibold bg-gray-900'}
                                            onClick={() =>  router.push(`/search/?tags=${tag.tag_id}`)}
                                            sx={{
                                                backgroundColor: 'rgba(0,0,0,0.6)',
                                                color: 'white',
                                                "&:hover": {
                                                    backgroundColor: "rgba(100,100,100,0.4)",
                                                },
                                                cursor: 'pointer',
                                            }}
                                            label={tag.name}
                                        />
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                </div>



            </div>

        </div>
    )
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const SEARCH_URL: string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/search`;

const createQuery = (query: string, page: number, sort: string, limit: number, filters: any) => {
   let url =  `${SEARCH_URL}?query=${query}&page=${page}&sort=${sort}&limit=${limit}`;
   if (!query) {
       url = `${SEARCH_URL}?page=${page}&sort=${sort}&limit=${limit}`;
    }
    const selectedGenres = filters.genres.filter((genre: any) => genre.selected).map((genre: any) => genre.label);
    const selectedTags = filters.tags.filter((tag: any) => tag.selected).map((tag: any) => tag.key);

    console.log("Selected Genres: ", selectedGenres);
    console.log("Selected Tags: ", selectedTags);
    const selectedPrice = filters.price.filter((price: any) => price.selected).map((price: any) => price.label);
    if (filters.genres && selectedGenres.length > 0) {
        // Filter out genres that are not selected
        url += `&genres=${selectedGenres.join('_')}`;
    }
    if (filters.tags && selectedTags.length > 0) {
        // Filter out tags that are not selected
        url += `&tags=${selectedTags.join('_')}`;
    }
    if (filters.price && selectedPrice.length > 0) {
        // Filter out tags that are not selected
        url += `&price=${selectedPrice.join('_')}`;
    }
    console.log("URL: ", url);
    return url;
}

interface ResultsProps {
    query: string;
    filters: any;
    page: number;
    sort: string;
    limit: number;
}


function Results({query, filters, page, sort, limit}: ResultsProps) {
    const { data, error } = useSWR(createQuery(query, page, sort, limit, filters), fetcher);

    if (error) return <div>Failed to load</div>
    if (!data) return <div>Loading...</div>

    return (
        <div className="flex flex-col gap-2 w-full p-2">
            {data.content.map((result: any) => (
                <div key={result.id}>
                    <ResultItem movie={result} />
                </div>
            ))}
        </div>
    )
}

interface ChipData {
    key: number;
    label: string;
    selected: boolean;
}

const GENRE_DATA = [
    { key: 1, label: 'Action' },
    { key: 2, label: 'Comedy' },
    { key: 3, label: 'Drama' },
    { key: 4, label: 'Horror' },
    { key: 5, label: 'Romance' },
    { key: 6, label: 'Sci-Fi' },
    { key: 7, label: 'Fantasy'},
    { key: 8, label: 'Thriller'},
    { key: 9, label: 'Adventure' },
    { key: 10, label: 'Animation' },
    { key: 11, label: 'Documentary' },
    { key: 12, label: 'Mystery' },
    { key: 13, label: 'Biography' },
    { key: 14, label: 'History' },
    { key: 15, label: 'Western' },
    { key: 16, label: 'War' },
    { key: 17, label: 'Musical' },
    { key: 18, label: 'Sport' },
    { key: 19, label: 'Family' },
    { key: 20, label: 'Short' },
    { key: 21, label: 'News' },
];

const PRICE_DATA = [
    { key: 1, label: 'Under $10' },
    { key: 2, label: '$10 to $20',},
    { key: 3, label: 'Under $100' },
];

const RATING_DATA = [
    { key: 1, label: 'G' },
    { key: 2, label: 'PG' },
    { key: 3, label: 'PG-13' },
    { key: 4, label: 'R' },
    { key: 5, label: 'NC-17' },
];

const DEBOUNCE_DELAY = 300;
const useDebounce = (value: any, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const ITEM_SIZE = 35;
// @ts-ignore
const innerElementType = forwardRef(({ style, ...rest }, ref) => (
    <div
        ref={ref}
        style={{
            ...style,
        }}
        {...rest}
    />
));

export default function Search() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const query_param = searchParams.get("query");
    const genres_param = searchParams.get("genres");
    const tags_param = searchParams.get("tags");

    console.log("Query Param: ", query_param);
    console.log("Genres Param: ", genres_param);
    console.log("Tags Param: ", tags_param);

    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
    const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 10);
    const [sort, setSort] = useState(searchParams.get("sort") || "relevance");
    const [isExpanded, setIsExpanded] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState({
        genres: [],
        tags: [],
        price: [],
        rating: [],
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            //fetch the tags from the API
            const selected_tags = tags_param ? tags_param.split('_') : []; //List of id of tags
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/tag/all`);
            const json = await response.json();
            //covert the data to the format of ChipData
            const data = json.map((tag: any) => ({
                key: tag.tag_id,
                label: tag.name,
                selected: selected_tags.includes(String(tag.tag_id))
            }));

            setSelectedFilters((prev: any) => {
                return {...prev, tags: data};
            });
            setIsLoading(false);
        };

        const fetchGenres = async () => {
            const selected_genres = genres_param ? genres_param.split('_') : []; //List of id of genres
            const data = GENRE_DATA.map((genre) => ({
                key: genre.key,
                label: genre.label,
                selected: selected_genres.includes(genre.label)
            }));

            setSelectedFilters((prev: any) => {
                return {...prev, genres: data};
            });
        }

        const fetchRating = async () => {
            const selected_rating = genres_param ? genres_param.split('_') : []; //List of id of genres
            const data = RATING_DATA.map((rating) => ({
                key: rating.key,
                label: rating.label,
                selected: false
            }));

            setSelectedFilters((prev: any) => {
                return {...prev, rating: data};
            });
        }

        const fetchPrices = async () => {
            const selected_prices = genres_param ? genres_param.split('_') : []; //List of id of genres
            const data = PRICE_DATA.map((price) => ({
                key: price.key,
                label: price.label,
                selected: false
            }));

            setSelectedFilters((prev: any) => {
                return {...prev, price: data};
            });
        }
        fetchGenres();
        fetchPrices();
        fetchTags();
        fetchRating();
    }, [query_param, genres_param, tags_param]);

    const toggleFilter = (type: string, value: number) => {

        setSelectedFilters((prev) => {
            const currentValues = prev[type as keyof typeof prev];
           //toggle the selected value
            const newValues = currentValues.map((item: any) => {
                if (item.key === value) {
                    return { ...item, selected: !item.selected };
                }
                return item;
            });
            return { ...prev, [type]:  newValues };
        });
    };

    const handleDelete = (chipToDelete: ChipData, type: String) => () => {
        //type: genres, tags, price
        setSelectedFilters((prev: any) => {
            const newValues =  prev[type as keyof typeof prev].map((item: any) => {
                if (item.key === chipToDelete.key) {
                    return { ...item, selected: false };
                }
                return item;
            });
            return { ...prev, [type as keyof typeof prev]: newValues };
        });
    };

    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSort = event.target.value;
        setSort(newSort);
    }

    const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newLimit = Number(event.target.value);
        setLimit(newLimit);
    }

    // @ts-ignore
    return (
        <div className={"flex flex-col gap-2 md:p-2 text-white"}>

            <div className={"flex flex-wrap gap-2 "}>
                {selectedFilters.genres.filter( (genre: any) => genre.selected).map((data: any) => (
                    <div key={data.key}>
                        <Chip
                            className={'text-sm font-semibold bg-gray-900'}
                            onDelete={handleDelete(data, 'genres')}
                            sx={{
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                "&:hover": {
                                    backgroundColor: "rgba(100,100,100,0.4)",
                                },
                                cursor: 'pointer',
                            }}
                            label={data.label}
                        />
                    </div>
                ))}

                {selectedFilters.tags.filter( (tag: any) => tag.selected).map((data: any) => (
                    <div key={data.key}>
                        <Chip
                            className={'text-sm font-semibold bg-gray-900'}
                            onDelete={handleDelete(data, 'tags')}
                            sx={{
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                "&:hover": {
                                    backgroundColor: "rgba(100,100,100,0.4)",
                                },
                                cursor: 'pointer',
                            }}
                            label={data.label}
                        />
                    </div>
                ))}

                {selectedFilters.price.filter( (price: any) => price.selected).map((data: any) => (
                    <div key={data.key}>
                        <Chip
                            className={'text-sm font-semibold bg-gray-900'}
                            onDelete={handleDelete(data, 'price')}
                            sx={{
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                "&:hover": {
                                    backgroundColor: "rgba(100,100,100,0.4)",
                                },
                                cursor: 'pointer',
                            }}
                            label={data.label}
                        />
                    </div>
                ))}
            </div>

            <div className="flex gap-2 text-white h-screen">

                {/* Sidebar */}
                <div
                    className={`${
                        isExpanded ? 'w-72 ' : 'w-0'
                    }    transition-all duration-300 overflow-y-auto`}
                >
                    {/* Filters */}
                    {isExpanded && (
                        <div className="">
                            {/* Genres Filter */}
                            <Accordion
                                sx={{
                                    backgroundColor: 'var(--color-gray-800)', // Darker semi-transparent background
                                    backdropFilter: 'blur(20px)', // Stronger frosted glass effect
                                    color: 'white', // White text
                                    boxShadow: '0 1px 12px rgba(0, 0, 0, 0.25)', // Subtle shadow for depth
                                    border: '1px solid rgba(100, 100, 100, 0.2)', // White border
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // White expand icon
                                    aria-controls="panel1a-content"
                                    id="panel1a-header">
                                    <p className={"text-lg font-semibold"}>Genres</p>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="space-y-1">
                                        {selectedFilters.genres.map((genre: any) => (
                                            <label key={genre.key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={genre.selected}
                                                    onChange={() => toggleFilter('genres', genre.key)}
                                                />
                                                {genre.label}
                                            </label>
                                        ))}
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            {/* Rating Filter */}
                            <Accordion
                                sx={{
                                    backgroundColor: 'var(--color-gray-800)', // Darker semi-transparent background
                                    backdropFilter: 'blur(20px)', // Stronger frosted glass effect
                                    color: 'white', // White text
                                    boxShadow: '0 1px 12px rgba(0, 0, 0, 0.25)', // Subtle shadow for depth
                                    border: '1px solid rgba(100, 100, 100, 0.2)', // White border
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // White expand icon
                                    aria-controls="panel1a-content"
                                    id="panel1a-header">
                                    <p className={"text-lg font-semibold"}>Rating</p>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="space-y-1">
                                        {selectedFilters.rating.map((rating: any) => (
                                            <label key={rating.key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={rating.selected}
                                                    onChange={() => toggleFilter('rating', rating.key)}
                                                />
                                                {rating.label}
                                            </label>
                                        ))}
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            {/* Price Filter */}
                            <Accordion
                                sx={{
                                    backgroundColor: 'var(--color-gray-800)', // Darker semi-transparent background
                                    backdropFilter: 'blur(20px)', // Stronger frosted glass effect
                                    color: 'white', // White text
                                    boxShadow: '0 1px 12px rgba(0, 0, 0, 0.25)', // Subtle shadow for depth
                                    border: '1px solid rgba(100, 100, 100, 0.2)', // White border
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // White expand icon
                                    aria-controls="panel2a-content"
                                    id="panel2a-header">
                                    <p className={"text-lg font-semibold"}>Price</p>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="space-y-1">
                                        {selectedFilters.price.map((price: any) => (
                                            <label key={price.key} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="mr-2"
                                                    checked={price.selected}
                                                    onChange={() => toggleFilter('price', price.key)}
                                                />
                                                {price.label}
                                            </label>
                                        ))}
                                    </div>
                                </AccordionDetails>
                            </Accordion>

                            {/* Tags Filter */}
                            <Accordion
                                sx={{
                                    backgroundColor: 'var(--color-gray-800)', // Darker semi-transparent background
                                    backdropFilter: 'blur(20px)', // Stronger frosted glass effect
                                    color: 'white', // White text
                                    boxShadow: '0 1px 12px rgba(0, 0, 0, 0.25)', // Subtle shadow for depth
                                    border: '1px solid rgba(100, 100, 100, 0.2)', // White border
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} // White expand icon
                                    aria-controls="panel2a-content"
                                    id="panel2a-header">
                                    <p className={"text-lg font-semibold"}>Tags</p>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <div className="space-y-1">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center">
                                                <p className={"text-lg font-semibold"}>Loading...</p>
                                            </div>
                                        ) : (
                                            <List
                                                className="List"
                                                itemData={selectedFilters.tags}
                                                height={450}
                                                innerElementType={innerElementType}
                                                itemCount={1000}
                                                itemSize={ITEM_SIZE}
                                                width={250}
                                            >
                                                {({ index, style }) => (
                                                    <div
                                                        className="flex items-center justify-start"
                                                        key={index}
                                                        style={style}
                                                    >
                                                        <label className="flex items-center mr-2">
                                                            <input
                                                                type="checkbox"
                                                                className="mr-2"
                                                                checked={selectedFilters.tags[index].selected}
                                                                onChange={() => toggleFilter('tags', selectedFilters.tags[index].key)}
                                                            />
                                                            {selectedFilters.tags[index].label}
                                                        </label>
                                                    </div>
                                                )}
                                            </List>
                                        )}
                                    </div>
                                </AccordionDetails>
                            </Accordion>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 ">
                    <div className={"flex flex-col items-center justify-center"}>

                        <div className={"w-full flex flex-row  justify-between"}>

                            <div className={"flex flex-row gap-2 "}>
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                >
                                    <Filter1Outlined sx={{ color: 'white' }} />
                                </button>
                                <select
                                    value={sort}
                                    onChange={handleSortChange}
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="rating">Rating</option>
                                    <option value="year">Year</option>
                                </select>

                                <select
                                    value={limit}
                                    onChange={handleLimitChange}
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                >
                                    <option value="10">10</option>
                                    <option value="20">20</option>
                                    <option value="50">50</option>
                                </select>
                            </div>


                            <div className="flex flex-row gap-2">
                                <button
                                    onClick={() => setPage(Number(page) - 1)}
                                    disabled={Number(page) <= 1}
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(Number(page) + 1)}
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                >
                                    Next
                                </button>
                            </div>
                        </div>

                        <Results query={query_param} filters={selectedFilters} page={page} sort={sort} limit={limit} />

                        <div className="flex flex-row gap-2 mt-4">
                            {page > 1 && (
                                <button
                                    onClick={() => setPage(Number(page) - 1)}
                                    disabled={page <= 1}
                                    className="bg-gray-800 text-white p-2 rounded-lg"
                                >
                                    Previous
                                </button>
                            )}

                            <button
                                onClick={() => setPage(Number(page) + 1)}
                                className="bg-gray-800 text-white p-2 rounded-lg"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>


    )
}