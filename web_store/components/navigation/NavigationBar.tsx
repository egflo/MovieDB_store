import Navbar from "react-bootstrap/Navbar";
import {Autocomplete, Box, NoSsr, TextField} from "@mui/material";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {CircularProgress} from "@mui/material";
import {Movie} from "../../models/Movie";
import {Fragment} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHeart, faUser, faFilm, faSearch} from "@fortawesome/free-solid-svg-icons";

import Typography from "@mui/material/Typography";

import {signInWithGoogle, signInWithEmail} from "../../utils/firebase";
import NavigationActionItems from "./NavigationActionItems";



const SEARCH_URL: string = 'http://localhost:8080/movie/search/';


function NavigationBar() {
    const router = useRouter();
  const [search, setSearch] = useState('' as string);
  const [options, setOptions] = useState(new Array<Movie>());
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  function sigin() {
    signInWithGoogle();
  }

    useEffect(() => {
        let active = true;

        if (!loading) {
            return undefined;
        }

        if (search.length < 1) {
            setOptions([]);
            setLoading(false);
            return undefined;
        }

        (async () => {
            const response = await fetch(SEARCH_URL + search);
            const pageable = await response.json();

            console.log("Response: " + pageable.content);

            if (active) {
                setOptions(pageable.content);
                setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [loading]);


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
                    <FontAwesomeIcon icon={faFilm} size={"2x"} style={{marginRight:'10px', marginLeft:'10px', color:'#197EFF'}}/>
              </Navbar.Brand>
              <Navbar.Toggle />

              {/*<Navbar.Collapse className="justify-content-end">
              <Autocomplete
                  id="autocomplete"
                  sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      height: '2.4rem',

                      '& input': {
                          border: 'none',
                          height: '100%',
                          minWidth: 300,
                          width: 400,
                          maxWidth: 400,
                          bgcolor: 'background.paper',
                          color: (theme) =>
                              theme.palette.getContrastText(theme.palette.background.paper),
                      },
                      '& button': {
                          height: '100%',
                          width: '2rem',
                          backgroundColor: '#197EFF',
                          border: 'none',
                          color: 'white',
                          outline:'inherit',
                          borderTopLeftRadius: 1,
                          borderBottomLeftRadius: 1,
                            '&:hover': {
                                backgroundColor: '#197EFF',
                            }

                      },
                      borderRadius: 1,
                      border: "1px solid #ced4da",

                  }}
                  open={open}
                  filterOptions={(x) => x}
                  onOpen={() => {
                      setOpen(true);
                  }}
                  onClose={() => {
                      setOpen(false);
                  }}
                  isOptionEqualToValue={(option, value) => option.title === value.title}
                  getOptionLabel={(option) => {
                    console.log("Option: " + option.title);
                    return option.title;
                  }}
                  options={options}
                  loading={loading}
                  onInputChange={(event, newInputValue) => {
                          console.log(newInputValue)
                          setSearch(newInputValue);
                          setLoading(true);
                      }
                  }
                  onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                          console.log("enter")
                          console.log(event.target)}
                  }}
                  renderInput={(params) => (
                      <div ref={params.InputProps.ref}>
                          <input type="text"
                                 {...params.inputProps} />

                          <button type="submit"

                                  aria-label="search"

                          >
                              <FontAwesomeIcon icon={faSearch} color={"white"}></FontAwesomeIcon>
                          </button>

                      </div>
                  )}

                  renderOption={(option: any, state) => {
                      return (
                          <Box
                              sx={{ display: 'flex', alignItems: 'center', p: 0.5 }}
                          >
                              <img
                                  src={state.poster}
                                  alt={state.title}
                                  style={{ width: 64, height: 90, borderRadius: 2 }}
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
*/}
              <Navbar.Collapse className="justify-content-end" style={{padding:'5px', color:'#197EFF'}}>

                  <NavigationActionItems/>

              </Navbar.Collapse>

          </Navbar>
      </NoSsr>
  );
}

export default NavigationBar;