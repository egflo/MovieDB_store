import {Box} from "@mui/material";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import React from "react";


type HeaderProps = {
    title: String;
}

export default function Header({title}: HeaderProps) {

    return (
        <Box className="header">
            <Box className="header__sub" style={
                {
                    display:'flex',
                    flexDirection:'row',
                    alignItems:'center',
                    gap:'10px',
                }
            }>
                <Box className="container__main__shape"></Box>
                <Typography
                    sx={{
                        color: theme => theme.palette.primary.contrastText,
                    }}
                    variant="h5"className="container__header__title">{title}</Typography>
            </Box>

            <Divider style={
                {
                    width: '100%',
                    height: '4px',
                    backgroundColor: 'rgba(255,255,255,0.0)',
                    borderRadius: '1px',
                }}></Divider>
        </Box>
    );
}