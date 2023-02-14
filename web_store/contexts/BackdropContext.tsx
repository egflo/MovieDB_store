import {ToastType} from "../components/Toast";
import React, {createContext} from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export type BackdropContextType = {
    show: (children: any) => void;
}

const BackdropContext = createContext({} as BackdropContextType);

export default BackdropContext;

export function BackdropProvider({children} : {children: any}) {
    const [open, setOpen] = React.useState(false);
    const handleClose = () => {
        setOpen(false);
    };
    const handleToggle = () => {
        setOpen(!open);
    };

    const show = (children: any) => {
        setOpen(true);
    }

    return (
        <BackdropContext.Provider
            value={{show}
        }>
            {children}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={open}
                onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </BackdropContext.Provider>
    );
}
