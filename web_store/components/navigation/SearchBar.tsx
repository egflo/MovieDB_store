import React, {useEffect, useState} from "react";
import {Autocomplete, Box, CircularProgress, TextField, Typography} from "@mui/material";
import {NoSSR} from "next/dist/shared/lib/dynamic-no-ssr";
import {useRouter} from "next/router";
import {Movie} from "../../models/Movie";
import {styled} from "@mui/material/styles";
import {axiosInstance} from "../../utils/firebase";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import {theme} from "../../pages/_app";

const SEARCH_URL: string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/search/`;


const SearchBox = styled((props) => (
    <TextField InputProps={{ disableUnderline: true }} {...props} />
))(({ theme }) => ({

    '& .MuiFilledInput-root': {

        [theme.breakpoints.down('sm')]: {
            minWidth: '58vw',
            width: '58vw',


        },

        [theme.breakpoints.up('sm')]: {
            minWidth: '470px',
        },

        // border: '1px solid #e2e2e1',
        border: '0px',
        overflow: 'hidden',
        borderTopLeftRadius: '5px',
        borderBottomLeftRadius: '5px',
        borderTopRightRadius: '0px',
        borderBottomRightRadius: '0px',
        //backgroundColor: theme.palette.mode === 'light' ? '#fcfcfb' : '#2b2b2b',
        transition: theme.transitions.create([
            'border-color',
            'background-color',
            'box-shadow',
        ]),
        '&.Mui-focused': {
            //boxShadow: `${alpha(theme.palette.primary.main, 0.25)} 0 0 0 2px`,
            // borderColor: theme.palette.primary.main,
        },
    },
}));

function SearchBar() {
    const router = useRouter();
    const [value, setValue] = useState<Movie | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(new Array<Movie>());
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        if (inputValue === '') {
            setOptions([]);
            setLoading(false);
            return undefined;
        }

        (async () => {
            const response = await axiosInstance.get(SEARCH_URL + inputValue);
            const pageable = response.data;

            if (active) {
                setOptions(pageable.content);
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading, inputValue]);


    useEffect(() => {
        if (!open) {
            setOptions([]);
        }
    }, [open]);

    return (
        <div className="flex flex-row items-center justify-center">
            {expanded && (
                <div className={"transition duration-500"}>
                    <NoSSR>
                        <Autocomplete
                            id="autocomplete"
                            size="small"

                            open={open}
                            onOpen={() => {
                                setOpen(true);
                            }}
                            onClose={() => {
                                setOpen(false);
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            getOptionLabel={(option) => option.title}
                            value={value}
                            onChange={(event, newValue) => {
                                if (newValue) {
                                    router.push('/movie/' + newValue);
                                }
                            }}
                            onInputChange={(event, newInputValue) => {
                                setInputValue(newInputValue);
                                setLoading(true);

                            }}

                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    router.push('/search/' + inputValue);
                                    setOpen(false)
                                }
                            }}
                            options={options}
                            loading={loading}
                            selectOnFocus
                            clearOnBlur
                            renderInput={
                                (params) => (
                                    <div ref={params.InputProps.ref} style={{display: 'flex'}}>
                                        <SearchBox
                                            {...params}
                                            // @ts-ignore
                                            label="Search Movies"
                                            variant="filled"
                                            InputProps={{
                                                ...params.InputProps,
                                                endAdornment: (
                                                    <React.Fragment>
                                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                                        {params.InputProps.endAdornment}
                                                    </React.Fragment>
                                                ),
                                            }}
                                        />


                                    </div>
                                )}

                            renderOption={(option: any, state) => {
                                return (
                                    <Box onClick={() => { router.push('/movie/' + state.movieId); }}
                                         sx={{ display: 'flex',
                                             alignItems: 'center',
                                             p: 0.5, cursor: 'pointer',
                                             gap: 2,
                                             '&:hover': { backgroundColor: 'grey' },

                                         }}

                                    >
                                        <img
                                            className={"hidden md:block"}
                                            src={state.poster}
                                            alt={state.title}
                                            style={{ width: 65, height: 90, borderRadius: 2 }}
                                        />
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography variant="body1" noWrap>
                                                {state.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {state.year}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {state.director}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );}}
                        />
                    </NoSSR>
                </div>
            )}

            <IconButton
                onClick={handleExpandClick}
                sx={{color:'#197EFF'}}
                color="inherit"
                className="search-icon">
                <SearchIcon />
            </IconButton>
        </div>
    )
}


export default SearchBar;