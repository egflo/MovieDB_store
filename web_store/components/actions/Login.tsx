
import React from "react";
import IconButton from "@mui/material/IconButton";
import useToastContext from "../../hooks/useToastContext";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import LoginIcon from "@mui/icons-material/Login";
import {LoginForm} from "../forms/LoginForm";

export function Login() {
    const ref = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    const toast = useToastContext();

    const handleToggle = () => {
        setOpen(!open);
    }

    return (
        <>
            <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="Favorites"
                sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                onClick={handleToggle}
            >
                <LoginIcon />
            </IconButton>

            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
            >
                {open &&
                    <Box ref={ref}>
                        <LoginForm/>
                    </Box>}
            </Backdrop>

        </>
    );
}