// pages/api/get-colors.js

import NextCors from 'nextjs-cors';
import { extractColors } from 'extract-colors';
import axios from 'axios';

export default async function handler(req, res) {
    await NextCors(req, res, {
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        origin: '*',
        optionsSuccessStatus: 200,
    });

    const { src } = req.query;

    if (!src) {
        res.status(400).json({ error: 'No image source provided' });
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/api/proxy-image?src=${encodeURIComponent(src)}`, {
            responseType: 'arraybuffer',
        });
        const buffer = Buffer.from(response.data, 'binary');
        const colors = await extractColors(buffer);
        res.status(200).json(colors);
    } catch (error) {
        console.error('Error extracting colors:', error.message);
        res.status(500).json({ error: 'Failed to extract colors from image' });
    }
}
