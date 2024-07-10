// useInfiniteScroll.js
import useSWRInfinite from 'swr/infinite';
import {auth, axiosInstance} from "../utils/firebase";
import {Movie} from "../models/Movie";
import {Page} from "../models/Page";
import {useEffect, useState} from "react";
import {User} from "@firebase/auth";

const fetcher = async (url: string, page: number, token?: string ): Promise<Page<Movie>> => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axiosInstance.get(`${url}&page=${page-1}`, { headers });
    return response.data;
};

const getKey = (pageIndex: number, previousPageData: Page<Movie> | null, url: string) => {
    if (previousPageData && previousPageData.last) return null; // Reached the end
    return `${url}&page=${pageIndex}`;
};

const useInfiniteScroll = (url: string, authenticated: boolean) => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [token, setToken] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            setUser(user);
            if (user) {
                const token = await user.getIdToken();
                setToken(token);
            }
            setLoadingAuth(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {

        console.log("loadingAuth: ", loadingAuth);
    }, [loadingAuth]);

    const fetcherWithAuth = async (url: string, page: number) => {

        return fetcher(url, page, token || undefined);
    };


    // @ts-ignore
    const { data, error, size, setSize } = useSWRInfinite<Page<Movie>>(
        (pageIndex, previousPageData) => getKey(pageIndex, previousPageData, url),
            // @ts-ignore
            (key) => authenticated ? fetcherWithAuth(key, size) : fetcher(key, size),
    );


    const isAuth = authenticated ? loadingAuth : false;
    const isLoadingInitialData = !data && !error && !loadingAuth;
    const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
    const isEmpty = data?.[0]?.content.length === 0;
    const isReachingEnd = data && data[data.length - 1]?.last;

    return {
        data: data ? ([] as Movie[]).concat(...data.map(page => page.content)) : [],
        error,
        isAuth,
        isLoadingInitialData,
        isLoadingMore,
        isReachingEnd,
        setSize
};
};

export default useInfiniteScroll;
