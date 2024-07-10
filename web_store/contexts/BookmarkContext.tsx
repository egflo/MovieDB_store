import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {axiosInstance} from "../api/fetcher";
import {Bookmark} from "../models/Bookmark";
import {User} from "@firebase/auth";
import {auth} from "../utils/firebase"
import {Page} from "../models/Page";
import {Movie} from "../models/Movie";


let BOOKMARK_URL = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/bookmark/`
const BOOKMARKS = `${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/movie/bookmarks/?sortBy=created`;


// Define the types for the context
interface BookmarkContextProps {
    bookmarks: Bookmark[];
    loading: boolean;
    error: string | null;
    addBookmark: (id: string) => void;
    removeBookmark: (id: string) => void;
    getBookmark: (movieId: string) => Bookmark | null;

}
// Create the context
const BookmarkContext = createContext<BookmarkContextProps | undefined>(undefined);

export const useBookmarkContext = (): BookmarkContextProps => {
    const context = useContext(BookmarkContext);
    if (!context) {
        throw new Error('useBookmarkContext must be used within a BookmarkProvider');
    }
    return context;
};

interface BookmarkProviderProps {
    children: ReactNode;
}

const BookmarkProvider = ({ children }: BookmarkProviderProps): JSX.Element => {
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                setUser(user);
                const token = await user.getIdToken();
                fetchBookmarks(token);
            } else {
                setUser(null);
                setBookmarks([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchBookmarks = async (token: string) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get<Page<Bookmark>>(`${BOOKMARK_URL}?limit=50`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setBookmarks(response.data.content);
        } catch (error) {
            // @ts-ignore
            //setError(error.message);
        } finally {
            setLoading(false);
        }
    };


    const addBookmark = async (id: string) => {
        try {
            if (!user) throw new Error('User is not authenticated');
            const token = await user.getIdToken();
            const payload = { movieId: id, userId: user.uid, created: new Date() };
            // Add bookmark
            const response = await axiosInstance.post(`${BOOKMARK_URL}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBookmarks((prevBookmarks) => [response.data, ...prevBookmarks]);
        } catch (error) {
            // @ts-ignore
            setError(error.message);
        }
    };

    const getBookmark = (id: string): Bookmark | null => {
        return bookmarks.find((bookmark) => bookmark.movie.id === id) || null;
    };


    const removeBookmark = async (id: string) => {
        try {
            if (!user) throw new Error('User is not authenticated');
            const token = await user.getIdToken();
            await axiosInstance.delete(`${BOOKMARK_URL}${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
        } catch (error) {
            // @ts-ignore
            setError(error.message);
        }
    };

    return (
        <BookmarkContext.Provider value={{ bookmarks, loading, error, addBookmark, removeBookmark, getBookmark }}>
            {children}
        </BookmarkContext.Provider>
    );
};

export default BookmarkProvider;
