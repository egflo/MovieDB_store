import {useSignOut} from 'react-firebase-hooks/auth';
import {auth} from "../../utils/firebase";
import React, {useEffect} from "react";
import {CircularProgress} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import useToastContext from "../../hooks/useToastContext";
import LogoutIcon from "@mui/icons-material/Logout";
import {useRouter} from "next/router";
import {ToastType} from "../Toast";
import {ShoppingBagOutlined} from "@mui/icons-material";

/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref: any, setOpen: any) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event: { target: any; }) {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}

export function Logout() {
    const ref = React.useRef(null);
    const [open, setOpen] = React.useState(false);
    useOutsideAlerter(ref, setOpen);
    const toast = useToastContext();
    const router = useRouter();

    const handleToggle = () => {
        setOpen(!open);
    };

    const [signOut, loading, error] = useSignOut(auth);

    if (error) {
        return (
            <Typography variant="subtitle1" noWrap component="div" sx={{ display: { color:'inherit' } }}>
                {error.message}
            </Typography>
        );
    }
    if (loading) {
        return <CircularProgress/>;
    }

    return (
        <>
            <IconButton
                onClick={() => {
                    signOut().then(() => {
                        toast.show("Logged out successfully", ToastType.SUCCESS);
                        router.push("/");
                    }).catch((error) => {
                        toast.show(error.message, ToastType.ERROR);
                    });
                }}

                size="large"
                edge="end"
                color="inherit"
                aria-label="Favorites"
                sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
            >
                <div className={'flex flex-row align-middle gap-2'}>
                    <LogoutIcon fontSize={'medium'}/>

                    <div className={'block md:hidden'}>
                        <Typography variant="subtitle1">
                            Logout
                        </Typography>
                    </div>
                </div>
            </IconButton>
        </>
    );
}