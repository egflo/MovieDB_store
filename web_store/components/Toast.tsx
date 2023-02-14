
import Snackbar, {SnackbarOrigin} from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import React, {Children, cloneElement, Component} from "react";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


export enum ToastType {
    SUCCESS = "success",
    ERROR=  "error",
    INFO = "info",
    WARNING = "warning",
}

enum ToastPosition {
    TOP_LEFT = "top-left",
    TOP_RIGHT = "top-right",
    BOTTOM_LEFT = "bottom-left",
    BOTTOM_RIGHT = "bottom-right",

}

export interface ToastState extends SnackbarOrigin {
    open: boolean;
    message: string;
    type: ToastType;
}

export interface ToastProps {
    children: React.ReactNode;
    position: ToastPosition;
}


let ToastState;
ToastState = {
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: "",
    type: ToastType.INFO,
}

//https://reactjs.org/docs/composition-vs-inheritance.html
export default function Toast(props: any) {

    const [state, setState] = React.useState<ToastState>({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        message: "",
        type: ToastType.INFO,
    });
    const { vertical, horizontal, open, message, type } = state;

    const handleClick = (message: string, type: ToastType) => () => {
        setState({ ...state, open: true, message: message, type: type });
    };

    const handleClose = () => {
        setState({ ...state, open: false });
    };

    //Pass data to children
   // const childrenWithProps = Children.map(children, child => {
        // checking isValidElement is the safe way and avoids a typescript error too
        //if (React.isValidElement(child)) {
            // @ts-ignore
         //   return cloneElement(child, { handleClick: handleClick });
        //}

        //return child;
    //});

    return (
        <>

            <Snackbar anchorOrigin={{ vertical, horizontal }} open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </>

    )
}