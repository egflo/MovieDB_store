import React, { useState, useEffect } from 'react';
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";

interface PosterImageProps {
    name: string;
    imageUrl?: string;
    width?: number;
    height?: number;
    className?: string;
}

const ProfileImage: React.FC<PosterImageProps> = ({
                                                       name,
                                                       imageUrl,
                                                       width = 64,
                                                       height = 64,
                                                       className = '',
                                                   }) => {
    const [isImageValid, setIsImageValid] = useState<boolean>(true);

    useEffect(() => {
        if (!imageUrl) {
            setIsImageValid(false);
            return;
        }

        let isMounted = true;
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => {
            if (isMounted) setIsImageValid(true);
        };
        img.onerror = () => {
            if (isMounted) setIsImageValid(false);
        };

        return () => {
            isMounted = false;
        };
    }, [imageUrl]);

    const sizeClass = `w-[${width}px] h-[${height}px] min-w-[${width}px] min-h-[${height}px] max-w-[${width}px] max-h-[${height}px]`;
    return (
        <div
            className={`flex items-center justify-center rounded-lg bg-gray-700  ${sizeClass} ${className} `}
            style={{ width: width, height: height }}
        >
            {isImageValid && imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setIsImageValid(false)}
                />
            ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-800  rounded-lg text-white font-bold `}>
                    <LocalMoviesIcon fontSize={"large"} />
                    <p className={`flex items-center justify-center text-sm font-semibold text-gray-300 text-ellipsis overflow-hidden whitespace-nowrap`}>
                        {name}
                    </p>
                </div>

            )}
        </div>
    );
};

export default ProfileImage;
