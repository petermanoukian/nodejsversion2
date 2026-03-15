import path from 'path';
import fs from 'fs';
import { 
    IFileUploadService, 
    FileUploadOptions, 
    FileUploadResult 
} from '../../interfaces/Common/IFileUploadService';

export class FileUploadService implements IFileUploadService {
    /**
     * Processes and stores a general file
     */
    async upload(
        file: Express.Multer.File,
        folder: string,
        options: FileUploadOptions = {}
    ): Promise<FileUploadResult> {
        const {
            allowedMimeTypes,
            maxSizeInBytes,
            baseFileName,
        } = options;

        // 1. Validation: Size
        if (maxSizeInBytes && file.size > maxSizeInBytes) {
            throw new Error(`File size exceeds the limit of ${maxSizeInBytes} bytes.`);
        }

        // 2. Validation: Mime Type
        if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`File type ${file.mimetype} is not allowed.`);
        }

        const originalName = file.originalname;
        const extension = path.extname(originalName).toLowerCase();

        // 3. Sanitize filename (Replace spaces and slashes with dashes)
        let baseName = baseFileName ?? path.basename(originalName, extension);
        baseName = baseName.replace(/[\s/]/g, '-');

        // 4. Generate Unique Name
        const randomSuffix = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const fileName = `${baseName}-${randomSuffix}${extension}`;

        // 5. Paths logic
        const relativePath = `${folder}/${fileName}`;
        const absolutePath = path.join('public', relativePath);

        // 6. Ensure Directory exists
        fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

        // 7. Write File to Disk
        await fs.promises.writeFile(absolutePath, file.buffer);

        return {
            fileName: fileName,
            originalName: originalName,
            mimeType: file.mimetype,
            size: file.size,
            path: relativePath,
        };
    }

    /**
     * Removes a file from the disk
     */
    async remove(filePath: string): Promise<boolean> {
        try {
            const absolutePath = path.join('public', filePath);
            if (fs.existsSync(absolutePath)) {
                await fs.promises.unlink(absolutePath);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to remove file: ${filePath}`, error);
            return false;
        }
    }
}