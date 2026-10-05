import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Request, Response } from 'express';
import { uploadsDirectory } from '../../utils/imageStorage.js';

const imageExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif'
};

const hasValidImageSignature = (image: Buffer, mimeType: string) => {
    switch (mimeType) {
        case 'image/jpeg':
            return image.length >= 3 && image[0] === 0xff && image[1] === 0xd8 && image[2] === 0xff;
        case 'image/png':
            return image.length >= 8 && image.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
        case 'image/gif':
            return image.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/) !== null;
        case 'image/webp':
            return image.length >= 12 &&
                image.subarray(0, 4).toString('ascii') === 'RIFF' &&
                image.subarray(8, 12).toString('ascii') === 'WEBP';
        case 'image/avif':
            return image.length >= 12 &&
                image.subarray(4, 12).toString('ascii').match(/^ftyp(avif|avis)$/) !== null;
        default:
            return false;
    }
};

export const uploadImage = async (req: Request, res: Response) => {
    const mimeType = req.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    const extension = mimeType ? imageExtensions[mimeType] : undefined;
    const image = req.body;

    if (!mimeType || !extension || !Buffer.isBuffer(image) || image.length === 0) {
        return res.status(400).json({ message: 'A supported image file is required' });
    }

    if (!hasValidImageSignature(image, mimeType)) {
        return res.status(400).json({ message: 'The uploaded file is not a valid image' });
    }

    const filename = `${randomUUID()}.${extension}`;

    try {
        await mkdir(uploadsDirectory, { recursive: true });
        await writeFile(path.join(uploadsDirectory, filename), image, { flag: 'wx' });

        return res.status(201).json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Image upload failed:', error);
        return res.status(500).json({ message: 'Unable to store uploaded image' });
    }
};
