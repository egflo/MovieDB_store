'use client';

import {AuthContext, User} from './AuthContext';
import React from "react";

export interface AuthProviderProps {
    user: User | null;
    children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = (
    {
        user,
        children
    }) => {
    return (
        <AuthContext.Provider
            value={{
                user
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};