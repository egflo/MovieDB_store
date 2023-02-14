import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {useAuthState, useSignOut} from 'react-firebase-hooks/auth';
import {signInWithGoogle, auth} from "../../utils/firebase";
import Button from "@mui/material/Button";
import React from "react";
import {CircularProgress} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import useToastContext from "../../hooks/useToastContext";
import LogoutIcon from "@mui/icons-material/Logout";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import LoginIcon from "@mui/icons-material/Login";
import {LoginForm} from "../LoginForm";

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
                <Typography variant="subtitle1" noWrap component="div" sx={{ display: { color:'inherit' } }}>
                    Login
                </Typography>
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