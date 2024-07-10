import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import {Pagination, TextField} from "@mui/material";
import {Direction, Sort, SortBy} from "./searchTypes";
import {TablePagination} from "@mui/material";
import React from "react";

type ToolbarProps = {
    term: string;
    setTerm: (term: string) => void;

    limit: number;
    setLimit: (limit: number) => void;

    sort: Sort;
    setSort: (sort: Sort) => void;

    page: number;
    setPage: (page: number) => void;

    total: number;
}

export default function Toolbar({term, setTerm, limit, setLimit, sort, setSort, page, setPage, total}: ToolbarProps) {
    function processLimit(limit: number) {
        switch (limit) {
            case 0:
                setLimit(10);
                break;
            case 1:
                setLimit(15);
                break;
            case 2:
                setLimit(20);
                break;
            default:
                setLimit(25);

        }
    }

    function processSort(value: number) {
        switch (value) {
            case 0:
                setSort({sortBy: SortBy.ID, direction: Direction.DESC});
                break;
            case 1:
                setSort({sortBy: SortBy.CREATED, direction: Direction.DESC});
                break;
            case 2:
                setSort({sortBy: SortBy.CREATED, direction: Direction.ASC});
                break;
            default:
                setSort({sortBy: SortBy.ID, direction: Direction.DESC});
        }
    }

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    return (
        <Box className="container-fluid" sx={
            {
                width: "100%",
                position: "sticky",
                py: 2,
                top: 60,
                backgroundColor:  theme => theme.palette.background.default,
                zIndex: 1000,
            }
        }>
            <Box className="row flex-row">
                <Box className="col visible md:invisible">

                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <TextField
                            id="outlined-basic"
                            onChange={(event) => {setTerm(event.target.value)}}
                            label="Search"
                            variant="outlined" />
                    </FormControl>

                    <FormControl sx={{ m: 1, minWidth: 200 }}>
                        <InputLabel htmlFor="grouped-select">Sort By</InputLabel>
                        <Select
                            defaultValue="" id="sort-select" label="Sort By"
                            onChange={(event) => {
                                processSort(Number(event.target.value));
                            } }
                        >
                            <MenuItem value={0}>Relevance</MenuItem>
                            <MenuItem value={1}>Created: Newest to Oldest</MenuItem>
                            <MenuItem value={2}>Created: Oldest to Newest</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

            </Box>
        </Box>

    );
}