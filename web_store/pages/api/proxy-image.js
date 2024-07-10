// pages/api/proxy-image.js

import NextCors from 'nextjs-cors';
import axios from 'axios';

export default async function handler(req, res) {
    await NextCors(req, res, {
        methods: ['GET'],
        origin: '*',
        optionsSuccessStatus: 200,
    });

    const { src } = req.query;

    if (!src) {
        res.status(400).json({ error: 'No image source provided' });
        return;
    }

    try {
        const response = await axios.get(src, {
            responseType: 'arraybuffer',
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        res.status(200).send(Buffer.from(response.data, 'binary'));
    } catch (error) {
        console.error('Error fetching image:', error.message);
        res.status(500).json({ error: 'Failed to fetch image from source' });
    }
}
