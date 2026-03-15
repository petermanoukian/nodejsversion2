export type ImageUploadResult = {
    large: string;
    small: string;
    original_name: string;
}

export type ImageUploadOptions = {
    maxWidth?: number;
    maxHeight?: number;
    thumbWidth?: number;
    thumbHeight?: number;
    baseFileName?: string;
}

export interface IImageUploadService {
    upload(
        file: Express.Multer.File,
        largeFolder: string,
        smallFolder: string,
        options?: ImageUploadOptions
    ): Promise<ImageUploadResult>;
}