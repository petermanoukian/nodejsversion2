import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { IImageUploadService, ImageUploadOptions, ImageUploadResult } from '@service-interfaces/Common/IImageUploadService';

export class ImageUploadService implements IImageUploadService {
    async upload(
        file: Express.Multer.File,
        largeFolder: string,
        smallFolder: string,
        options: ImageUploadOptions = {}
    ): Promise<ImageUploadResult> {
        const {
            maxWidth = 1500,
            maxHeight = 1000,
            thumbWidth = 200,
            thumbHeight = 200,
            baseFileName,
        } = options;

        const originalName = file.originalname;
        const extension = path.extname(originalName).toLowerCase();

        // Sanitize base name
        let baseName = baseFileName ?? path.basename(originalName, extension);
        baseName = baseName.replace(/[\s/]/g, '-');

        // Generate file name
        let fileName: string;
        if (baseFileName) {
            // Controller already gave us catName-6digits
            // Add an extra 3 digits if desired
            const random3 = Math.floor(100 + Math.random() * 900).toString();
            fileName = `${baseName}-${random3}${extension}`;
        }  else {
            // Fallback: original name +3 digits

            const random3 = Math.floor(100 + Math.random() * 900).toString();
            fileName = `${baseName}-${random3}${extension}`;
        }

        const relativeLargePath = `${largeFolder}/${fileName}`;
        const relativeSmallPath = `${smallFolder}/${fileName}`;

        const largePath = path.join('public', relativeLargePath);
        const smallPath = path.join('public', relativeSmallPath);

        fs.mkdirSync(path.dirname(largePath), { recursive: true });
        fs.mkdirSync(path.dirname(smallPath), { recursive: true });

        const metadata = await sharp(file.buffer).metadata();
        const needsResize = (metadata.width ?? 0) > maxWidth || (metadata.height ?? 0) > maxHeight;

        await sharp(file.buffer)
            .resize(needsResize ? { width: maxWidth, height: maxHeight, fit: 'inside', withoutEnlargement: true } : undefined)
            .toFile(largePath);

        await sharp(file.buffer)
            .resize({ width: thumbWidth, height: thumbHeight, fit: 'cover' })
            .toFile(smallPath);

        return {
            large: relativeLargePath,
            small: relativeSmallPath,
            original_name: originalName,
        };
    }
}
