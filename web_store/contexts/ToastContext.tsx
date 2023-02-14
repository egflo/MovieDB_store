import React, {useState, useEffect, createContext, useCallback} from 'react';
import Snackbar from "@mui/material/Snackbar";
import {Alert, ToastState, ToastType} from "../components/Toast";

export type ToastContextType = {
    show: (message: string, type: ToastType) => void;
}

const ToastContext = createContext({} as ToastContextType);

export default ToastContext;

export function ToastProvider({children} : {children: any}) {
    const [toast, setToast] = React.useState<ToastState>({
        open: false,
        vertical: 'top',
        horizontal: 'center',
        message: "",
        type: ToastType.INFO,
    });
    const { vertical, horizontal, open, message, type } = toast;

    const handleClose = () => {
        setToast({ ...toast, open: false });
    };

    const show = useCallback((message: string, type: ToastType) => {
        setToast({ ...toast, open: true, message: message, type: type });
    }, [toast]);

    return (
        <ToastContext.Provider
            value={{show}
        }>
            {children}
            <Snackbar anchorOrigin={{ vertical, horizontal }} open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
}