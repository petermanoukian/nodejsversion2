export type FileUploadResult = {
    fileName: string;        // The stored name on disk
    originalName: string;    // The user's original filename
    mimeType: string;        // e.g., 'application/pdf'
    size: number;            // File size in bytes
    path: string;            // Relative path for storage
}

export type FileUploadOptions = {
    allowedMimeTypes?: string[]; // e.g., ['application/pdf', 'application/msword']
    maxSizeInBytes?: number;     // e.g., 5 * 1024 * 1024 for 5MB
    baseFileName?: string;       // Custom prefix if provided
}

export interface IFileUploadService {
    /**
     * Processes a general file upload (non-image)
     * @param file The Multer file object
     * @param folder The destination folder within the storage/public directory
     * @param options Validation and naming constraints
     */
    upload(
        file: Express.Multer.File,
        folder: string,
        options?: FileUploadOptions
    ): Promise<FileUploadResult>;

    /**
     * Deletes a file from the system
     * @param filePath Full or relative path to the file
     */
    remove(filePath: string): Promise<boolean>;
}