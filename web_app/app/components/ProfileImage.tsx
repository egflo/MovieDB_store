import { Person } from '@mui/icons-material';
import React, { useState } from 'react';
import { optimizedImage } from '@/lib/image';

interface ProfileImageProps {
    name: string;
    imageUrl?: string;
    size?: number;
    className?: string;
}

const getInitials = (name: string): string => {
    const names = name.trim().split(' ');
    if (names.length === 0) return '';
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

const ProfileImage: React.FC<ProfileImageProps> = ({
                                                       name,
                                                       imageUrl,
                                                       size = 64,
                                                       className = '',
                                                   }) => {
    // Keyed by url, so a new imageUrl gets tried again after a failure. This
    // replaces a new Image() preload that downloaded every photo twice.
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    const isImageValid = !!imageUrl && failedUrl !== imageUrl;

    const sizeClass = `w-[${size}px] h-[${size}px]`;
    //const initials = getInitials(name);

    return (
        <div
            className={`flex items-center justify-center rounded-full 
            isolate aspect-video  bg-gray-400/20 shadow-lg ring-1 ring-black/5
             text-white font-bold text-xl overflow-hidden ${sizeClass} ${className}`}
            style={{ width: size, height: size }}
        >
            {isImageValid && imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    {...optimizedImage(imageUrl, size, size)}
                    alt={name}
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={() => setFailedUrl(imageUrl)}
                />
            ) : (
                <p className={`flex items-center justify-center`}
                     style={{ fontSize: size / 3, lineHeight: `${size}px` }} // Center the initials vertically
                >
                    {name ? getInitials(name) : <Person></Person>}
                </p>
            )}
        </div>
    );
};

export default ProfileImage;
