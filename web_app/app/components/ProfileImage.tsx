import React, { useState, useEffect } from 'react';

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

    const initials = getInitials(name);
    const sizeClass = `w-[${size}px] h-[${size}px]`;

    return (
        <div
            className={`flex items-center justify-center rounded-full bg-gray-700 text-white font-bold text-xl overflow-hidden ${sizeClass} ${className}`}
            style={{ width: size, height: size }}
        >
            {isImageValid && imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setIsImageValid(false)}
                />
            ) : (
                <p className={`flex items-center justify-center`}
                     style={{ fontSize: size / 3, lineHeight: `${size}px` }} // Center the initials vertically
                >
                    {initials}
                </p>
            )}
        </div>
    );
};

export default ProfileImage;
