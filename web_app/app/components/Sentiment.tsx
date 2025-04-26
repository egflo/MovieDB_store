
'use client';
import React, { useState } from 'react';
import {SentimentState} from "@/app/models/SentimentState";

interface SentimentProps {
    id: string;
}

const Sentiment: React.FC<SentimentProps> = ({ id }) => {
    const [sentiment, setSentiment] = useState<string>(SentimentState.NONE);

    const handleSentimentChange = (newSentiment: string) => {
        setSentiment(newSentiment);
    };

    return (
        <div className="flex items-center">
            <button
                className={`p-2 rounded-l ${sentiment === 'like' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleSentimentChange('like')}
            >
                Like
            </button>
            <button
                className={`p-2 rounded-r ${sentiment === 'dislike' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                onClick={() => handleSentimentChange('dislike')}
            >
                Dislike
            </button>
        </div>
    );
}