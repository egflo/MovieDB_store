import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import nookies from "nookies";
import firebase from "firebase/app";
import {User} from "@firebase/auth";
import {auth} from "../utils/firebase";

interface AuthContextType {
    user: User | null;
    login: (user: string) => void;
    logout: () => void;
    loading: boolean;
    error: string | null;

}

export const AuthContext = createContext<{ user: User | null, token: string | null, isAuthenticated: boolean }>({
    user: null,
    token: null,
    isAuthenticated: false
});

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            (window as any).nookies = nookies;
        }
        return auth.onIdTokenChanged(async (user) => {
            console.log(`token changed!`);
            if (!user) {
                console.log(`no token found...`);
                setUser(null);
                setToken(null)
                nookies.destroy(null, "token");
                nookies.set(null, "token", "", {path: '/'});
                return;
            }

            console.log(`updating token...`);
            const token = await user.getIdToken();
            console.log(`token: ${token}`);
            setUser(user);
            setToken(token);
            nookies.destroy(null, "token");
            nookies.set(null, "token", token, {path: '/'});
        });
    }, []);

    const isAuthenticated = useMemo(() => !!user, [user]);

    // force refresh the token every 10 minutes
    useEffect(() => {
        const handle = setInterval(async () => {
            console.log(`refreshing token...`);
            const user = auth.currentUser;
            if (user) await user.getIdToken(true);
        }, 10 * 60 * 1000);
        return () => clearInterval(handle);
    }, []);

    return (
        <AuthContext.Provider
            value={{ user, token, isAuthenticated}}>{children}</AuthContext.Provider>
    );
}