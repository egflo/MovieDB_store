import React from 'react';
import { IconButton } from '@mui/material';
import { ThumbUpOffAltOutlined, ThumbDownAltOutlined, FavoriteBorderOutlined } from '@mui/icons-material';
import { useRateContext } from './Rate';
import {RateType} from "../../models/RateType";
import Box from "@mui/material/Box";

export function CustomRateUI() {
    const { rate, selected, setSelected, handleSelected} = useRateContext();

    return (
        <div>
            <div className={'hidden md:block'}>
                <Box className="
                            button_test
                            rounded-full
                            hover:bg-gray-700  hover:shadow-lg
                            flex
                            ">

                    <IconButton
                        className={"hover:bg-[rgb(59,130,246,0.5)] hover:shadow-lg hover:text-blue-500 "}
                        onClick={() => handleSelected(RateType.LIKE)}>
                        <ThumbUpOffAltOutlined className={"hover: blue-500 size-6 md:size-6"}></ThumbUpOffAltOutlined>
                    </IconButton>

                    <Box className="flex flex-row items-center gap-1">

                        <IconButton
                            className={"hover:bg-[rgb(59,130,246,0.5)] hover:shadow-lg hover:text-blue-500"}
                            onClick={() => handleSelected(RateType.DISLIKE)}>
                            <ThumbDownAltOutlined className={"size-6 md:size-6"}/>
                        </IconButton>

                        <IconButton
                            className={"hover:bg-[rgb(59,130,246,0.5)]  hover:shadow-lg hover:text-blue-500"}
                            onClick={() => handleSelected(RateType.LOVE)}>
                            <FavoriteBorderOutlined className={"size-6 md:size-6"}/>
                        </IconButton>
                    </Box>
                </Box>
            </div>

            <div className={'block md:hidden'}>
                <Box className="container__action">
                    <IconButton
                        style={{zIndex: 99}}
                        onClick={() => setSelected(!selected)}
                        aria-label="rate"
                    >
                        <ThumbUpOffAltOutlined className={"size-6 md:size-7"}/>
                    </IconButton>
                </Box>
            </div>
        </div>
    );
}
