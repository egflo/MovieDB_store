import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

interface AuthContextType {
    user: string | null;
    login: (user: string) => void;
    logout: () => void;
    loading: boolean;
    error: string | null;

}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            setUser(user);
        }
        setLoading(false);
    }, []);

    const login = (user: string) => {
        setUser(user);
        localStorage.setItem("user", user);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            loading,
            error,
        }),
        [user, loading, error]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}