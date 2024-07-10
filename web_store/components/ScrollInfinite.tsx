// InfiniteScrollComponent.tsx
import React, { useEffect, useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import './tailwind.output.css'; // Ensure Tailwind CSS is imported

interface Item {
    id: string;
    type: 'movie' | 'book' | 'music'; // Example item types
    title: string;
    poster: string;
    description: string;
}

interface InfiniteScrollProps {
    fetchUrl: string;
    direction: 'vertical' | 'horizontal';
    authenticated?: boolean;
}

const fetcher = async (url: string, token: string | null) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(url, { headers });
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }
    return res.json();
};

const InfiniteScrollComponent: React.FC<InfiniteScrollProps> = ({ fetchUrl, direction, authenticated = false }) => {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (authenticated) {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const token = await user.getIdToken();
                    setToken(token);
                } else {
                    setToken(null);
                }
            });

            return () => unsubscribe();
        }
    }, [authenticated]);

    const getKey = (pageIndex: number, previousPageData: Item[] | null) => {
        if (previousPageData && !previousPageData.length) return null; // Reached the end
        return `${fetchUrl}?page=${pageIndex + 1}`; // API endpoint
    };

    const { data, error, size, setSize } = useSWRInfinite<Item[]>(getKey, (key) => fetcher(key, token));

    const isLoading = !data && !error;
    const items = data ? [].concat(...data) : [];

    const loadMore = () => setSize(size + 1);

    return (
        <div
            className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} overflow-auto p-5 space-y-4 space-x-4`}
            style={{ height: '80vh' }} // Set a fixed height for vertical scrolling
            onScroll={(e) => {
                const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = e.currentTarget;
                if (direction === 'vertical' && scrollTop + clientHeight >= scrollHeight - 100) {
                    loadMore();
                } else if (direction === 'horizontal' && scrollLeft + clientWidth >= scrollWidth - 100) {
                    loadMore();
                }
            }}
        >
            {items.map((item) => (
                <div key={item.id} className="relative flex-shrink-0 w-48 h-72 transition-transform transform hover:scale-110 group">
                    <div className="relative w-full h-full overflow-hidden">
                        <img src={item.poster} alt={item.title} className="object-cover w-full h-full transition-transform transform group-hover:scale-110" />
                        <div className="absolute top-0 left-0 right-0 bottom-0 p-4 bg-black bg-opacity-75 text-white opacity-0 transform scale-95 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
                            <h3 className="text-lg font-bold">{item.title}</h3>
                            <p className="text-sm mt-2">{item.description}</p>
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && <p>Loading...</p>}
            {error && <p>Error loading items</p>}
        </div>
    );
};

export default InfiniteScrollComponent;
