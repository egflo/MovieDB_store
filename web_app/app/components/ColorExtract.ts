import { useState, useEffect } from 'react';
import { Palette } from 'auto-palette';

const proxy = `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_MOVIE_SERVICE_NAME}/proxy-image?url=`;
export const usePalette = (imageUrl: string) => {
    const [palette, setPalette] = useState<Palette | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPalette = async () => {
            try {

                console.log( `${proxy}${encodeURIComponent(imageUrl)}`);
                const response = await fetch(`${proxy}${encodeURIComponent(imageUrl)}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const blob = await response.blob();
                const img = new window.Image();
                img.src = URL.createObjectURL(blob);
                img.onload = () => {
                    const extractedPalette = Palette.extract(img);
                    setPalette(extractedPalette);
                };
            } catch (err) {
                setError('Failed to extract palette');
                console.error(err);
            }
        };

        if (imageUrl) {
            fetchPalette();
        }
    }, [imageUrl]);

    return { palette, error };
};