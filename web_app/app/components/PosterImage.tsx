import React, { useState } from 'react';
import LocalMoviesIcon from "@mui/icons-material/LocalMovies";
import { fallbackImage, optimizedImage } from "@/lib/image";

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
    // Optimized image, then fallbackImage, then the placeholder. Keyed by url,
    // so a reused component showing a different movie starts over.
    const [failure, setFailure] = useState<{ url: string; count: number } | null>(null);
    const failures = imageUrl && failure?.url === imageUrl ? failure.count : 0;
    const isImageValid = !!imageUrl && failures < 2;

    const sizeClass = `w-[${width}px] h-[${height}px] min-w-[${width}px] min-h-[${height}px] max-w-[${width}px] max-h-[${height}px]`;
    return (
        <div
            className={`flex items-center justify-center rounded-lg bg-gray-700  ${sizeClass} ${className} `}
            style={{ width: width, height: height }}
        >
            {isImageValid && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    {...(failures === 0
                        ? optimizedImage(imageUrl, width, height)
                        : { src: fallbackImage(imageUrl) })}
                    alt={name}
                    decoding="async"
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setFailure({ url: imageUrl, count: failures + 1 })}
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
