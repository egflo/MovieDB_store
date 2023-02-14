import React, {useState, useEffect, createContext, useCallback, useContext} from 'react';
import ToastContext, {ToastProvider} from "../contexts/ToastContext";


export default function useToastContext() {
    return useContext(ToastContext)
}