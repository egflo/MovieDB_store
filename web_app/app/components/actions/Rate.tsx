import IconButton from "@mui/material/IconButton";
import React, {useEffect, useState} from "react";
import {
    Favorite, ThumbDownAltOutlined, ThumbUpOffAltOutlined,
} from "@mui/icons-material";
import {useRef} from "react";
import {SentimentState} from "../../models/SentimentState";
import FavoriteBorderOutlined from "@mui/icons-material/FavoriteBorderOutlined";
import {useAuth} from "@/lib/firebase/AuthContext";
import {debounce} from "lodash";

const RATE_API : string = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_USER_SERVICE_NAME}/sentiment/rate`;

type RateProps = {
    id: string;
    children?: React.ReactNode
}

export default function Rate({ id }: RateProps) {
    const ref = useRef<HTMLDivElement>(null);
    const auth = useAuth();
    const [selected, setSelected] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);
    const [rate, setRate] = React.useState(SentimentState.NONE);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setSelected(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    const handleSelected = async (sentiment: SentimentState) => {
        // Check if the user is authenticated
        if (!auth.user) {
            console.error('User is not authenticated');
            return;
        }

        setRate(sentiment);
        setSelected(true);

        // Call the API to send the rating
        const body = {
            status: sentiment,
            objectId: id,
            userId: auth.user?.uid,
        };

        try {
            const response = await fetch(`${RATE_API}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.user?.idToken}`
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log("Response", data);
        } catch (error) {
            console.error('Error:', error);
        }
        // Reset the state after a short delay
        setTimeout(() => {
            setRate(SentimentState.NONE);
            setSelected(false);
            setHovered(false);
        }, 1000); // Adjust the delay as needed
    };

    const debouncedSetRate = debounce((sentiment: SentimentState) => {
        setRate(sentiment);
    }, 300);

    const contextValue = {
        rate,
        selected,
        setSelected,
    };

    return (
        <RateContext.Provider value={contextValue}>
            <div className="relative" // Added relative container
                 onMouseEnter={() => setHovered(true)}
                 onMouseLeave={() => setHovered(false)}
            >
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black transition-opacity duration-300"
                    style={{
                        opacity: hovered ? 0.5 : 0,
                        pointerEvents: 'none',
                        zIndex: 10
                    }}
                />

                {/* Main Content */}
                <div className="flex justify-center relative z-20"> {/* Added z-20 to stay above overlay */}
                    <div
                        className="relative flex items-center justify-center"
                        style={{
                            // @ts-ignore
                            '--tw-shadow': '0 0 20px rgba(0,0,0,0.3)',
                            'boxShadow': 'var(--tw-shadow)',
                        }}
                    >
                        {/* Left side button - ThumbDown */}
                        <div
                            className="absolute transition-all duration-300 ease-in-out bg-gray-900 hover:bg-gray-800 rounded-full"
                            style={{
                                transform: hovered ? 'translateX(-100%)' : 'translateX(0)',
                                opacity: hovered ? 1 : 0,
                                visibility: hovered ? 'visible' : 'hidden',
                                left: 0,
                            }}
                        >
                            <IconButton
                                onClick={() => handleSelected(SentimentState.DISLIKE)}
                                className="">
                                <ThumbDownAltOutlined sx={{ color: 'white' }} />
                            </IconButton>
                        </div>

                        {/* Center button - ThumbUp */}
                        <div className="z-10 bg-gray-900 hover:bg-gray-800 rounded-full  transition-all duration-300 ease-in-out">
                            <IconButton
                                onClick={() => handleSelected(SentimentState.LIKE)}
                                className="="
                                style={{
                                    transition: 'all 0.3s ease-in-out',
                                    transform: hovered ? 'scale(1.1)' : 'scale(1)',
                                }}
                            >
                                <ThumbUpOffAltOutlined sx={{ color: 'white' }} />
                            </IconButton>
                        </div>

                        {/* Right side button - Favorite */}
                        <div
                            className="absolute transition-all duration-300 ease-in-out bg-gray-900 hover:bg-gray-800 rounded-full"
                            style={{
                                transform: hovered ? 'translateX(100%)' : 'translateX(0)',
                                opacity: hovered ? 1 : 0,
                                visibility: hovered ? 'visible' : 'hidden',
                                right: 0,
                            }}
                        >
                            <IconButton
                                onClick={() => handleSelected(SentimentState.LOVE)}
                                className="">
                                <FavoriteBorderOutlined sx={{ color: 'white' }} />
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>

        </RateContext.Provider>

    )
}

const RateContext = React.createContext({
    rate: SentimentState.NONE,
    selected: false,
    setSelected: (selected: boolean) => {},
});

export const useRateContext = () => React.useContext(RateContext);