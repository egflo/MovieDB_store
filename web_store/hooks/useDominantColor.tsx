import { useState, useEffect } from 'react';
import ColorThief from 'colorthief';

const useDominantColor = (imageSrc: string) => {
    const [color, setColor] = useState<[number, number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = imageSrc;

        img.onload = () => {
            try {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(img);
                setColor(dominantColor);
                setLoading(false);
            } catch (err) {
                setError(err as Error);
                setLoading(false);
            }
        };

        img.onerror = (err) => {
            // @ts-ignore
            setError(err as Error);
            setLoading(false);
        };
    }, [imageSrc]);

    return { color, loading, error };
};

export default useDominantColor;
