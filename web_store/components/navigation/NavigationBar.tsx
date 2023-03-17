import Navbar from "react-bootstrap/Navbar";
import {Autocomplete, Box, NoSsr, TextField, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {Movie} from "../../models/Movie";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NavigationActionItems from "./NavigationActionItems";
import {axiosInstance} from "../../utils/firebase";
import {NoSSR} from "next/dist/shared/lib/dynamic-no-ssr";
import {CircularProgress} from "@mui/material";
import {styled} from "@mui/material/styles";
import SearchIcon from '@mui/icons-material/Search';
import TheatersIcon from '@mui/icons-material/Theaters';


const SEARCH_URL: string = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/search/`;

const SearchBox = styled((props) => (
    <TextField InputProps={{ disableUnderline: true }} {...props} />
))(({ theme }) => ({

    '& .MuiFilledInput-root': {

        [theme.breakpoints.down('sm')]: {
            minWidth: '70vw',
            width: '70vw',
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


function NavigationBar() {
    const router = useRouter();
    const [value, setValue] = useState<Movie | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(new Array<Movie>());
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);


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

    const handleAccountClick = (e: { preventDefault: () => void; }) => {
        e.preventDefault()
        router.push('/user')
    }
    return (
      <NoSsr>
          <Navbar sticky="top" bg="dark" variant="dark" style={{
                width: '100%',
                height: '4rem',
          }}>
              <Navbar.Brand href="/">
                  <TheatersIcon fontSize={'large'} sx={{marginLeft:'10px'}} color={'primary'}/>
              </Navbar.Brand>
              <Navbar.Toggle />

              <Navbar.Collapse className="justify-content-start">
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
                        console.log(event);
                        if (newValue) {
                            router.push('/movie/' + newValue);
                        }
                    }}
                    onInputChange={(event, newInputValue) => {
                        console.log(newInputValue);
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

                              <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.push('/search/' + inputValue);
                                        setOpen(false)
                                    } }
                                    style={{
                                        border: '0px',
                                        borderTopRightRadius: '5px',
                                        borderBottomRightRadius: '5px',
                                        color: 'white',
                                        backgroundColor: '#0F52BA',
                                    }} >
                                  <SearchIcon />
                              </button>
                          </div>
                      )}

                  renderOption={(option: any, state) => {
                      return (
                          <Box onClick={() => { router.push('/movie/' + state.movieId); }}
                              sx={{ display: 'flex',
                                  alignItems: 'center',
                                  p: 0.5, cursor: 'pointer',
                                  gap: 2,
                                  '&:hover': { backgroundColor: 'grey', color: 'grey' } }}
                          >
                              <img
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

                </Navbar.Collapse>

              <Navbar.Collapse className="justify-content-end" style={{padding:'5px', color:'#197EFF'}}>

                  <NavigationActionItems/>

              </Navbar.Collapse>

          </Navbar>
      </NoSsr>
  );
}

export default NavigationBar;