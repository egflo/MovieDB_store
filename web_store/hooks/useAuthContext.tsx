// Let's only export the `useAuth` hook instead of the context.
// We only want to use the hook directly and never the context component.
import {AuthContext} from "../contexts/AuthContext";

import React, {useState, useEffect, createContext, useCallback, useContext} from 'react';


export default function useAuthContext() {
    return useContext(AuthContext);
}