import Box from "@mui/material/Box";
import {Direction, Sort, SortBy} from "./searchTypes";
import React, {useState} from "react";
import Typography from "@mui/material/Typography";
import {ArrowDownward, ExpandLess, ExpandMore} from "@mui/icons-material";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridOnIcon from '@mui/icons-material/GridOn';


type ToolbarProps = {
    limit: number;
    setLimit: (limit: number) => void;

    sort: Sort;
    setSort: (sort: Sort) => void;

    page: number;
    setPage: (page: number) => void;

    view: boolean;
    setView: (view: boolean) => void;

    total: number;

}

const CardViewButton = ({view, onView}: {view: boolean, onView: (view: boolean) => void}) => {
    //Let the user switch between card and list view
    //Material UI Icons

    const handleView = () => {
        onView(!view);
    }

    return (
        <div className="group relative flex flex-col">
            <button onClick={handleView}
                    className={"rounded px-4 py-2 m-2 hover:bg-gray-500 text-white"}>
                <div className="flex flex-row gap-2 align-content-center justify-center">
                    <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        {view ?   <FormatListBulletedIcon fontSize={"small"}/> : <GridOnIcon fontSize={"small"}/>}
                    </Typography>
                </div>
            </button>
        </div>
    );

}

// @ts-ignore
const SortButton = ({ sortOptions, defaultSort, onSort }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [selectedSort, setSelectedSort] = useState(defaultSort);

    const handleSortClick = (option: any) => {
        setSelectedSort(option);
        setShowOptions(false);
        onSort(option);
    };

    return (
        <div className="group relative flex flex-col">

            <button onClick={() => setShowOptions(!showOptions)} className={" rounded px-4 py-2 m-2 hover:bg-gray-500 text-white"}>
                <div className="flex flex-row gap-2 align-content-center justify-center">
                    <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        Sort By:
                    </Typography>
                    <Typography variant="subtitle1" component="div" sx={{ flexGrow: 1 }}>
                        {selectedSort.label}
                    </Typography>

                    <div className="mt-1.0">

                        {showOptions ? <ExpandMore fontSize={"small"}/> : <ExpandLess fontSize={"small"}/>}
                    </div>
                </div>
            </button>
            <div className="transition ease-in-out duration-700 bg-zinc-900 rounded-md shadow-md  w-full z-999"
                    style={{overflow: "hidden", transitionProperty: "height", height: showOptions ? "300px" : "0px"}}
            >

                <ul className={"p-0"}>
                    {sortOptions.map((option: any) => (
                        <li key={option.value} onClick={() => handleSortClick(option)} className={"w-full px-4 py-2 m-2 hover:bg-gray-500 text-white m-0"}
                            style={{listStyleType: "none"}}
                        >
                            <Typography variant="subtitle1" component="div">
                                {option.label}
                            </Typography>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    );
};

export default function Toolbar({limit, setLimit, sort, setSort, page, setPage, total, view, setView}: ToolbarProps) {

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

    const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handleSort = (option: any) => {
        // sort items based on the selected option
        switch (option.value) {
            case 0:
                setSort({sortBy: SortBy.ID, direction: Direction.DESC});
                break;
            case 1:
                setSort({sortBy: SortBy.YEAR, direction: Direction.DESC});
                break;
            case 2:
                setSort({sortBy: SortBy.YEAR, direction: Direction.ASC});
                break;
            case 3:
                setSort({sortBy: SortBy.TITLE, direction: Direction.DESC});
                break;
            case 4:
                setSort({sortBy: SortBy.TITLE, direction: Direction.ASC});
                break;
            default:
                setSort({sortBy: SortBy.ID, direction: Direction.DESC});
        }
    };


    const options = [
        { value: 0, label: 'Relevance' },
        { value: 1, label: 'Newest' },
        { value: 2, label: 'Oldest' },
        { value: 3, label: 'Title A-Z' },
        { value: 4, label: 'Title Z-A'}
    ];

    return (
        <Box
            className={"flex flex-row justify-between items-center "}>
            <SortButton
                sortOptions={options}
                defaultSort={options[0]}
                onSort={handleSort}
            />

            <CardViewButton
                view={view}
                onView={setView}
            />

        </Box>
    );
}