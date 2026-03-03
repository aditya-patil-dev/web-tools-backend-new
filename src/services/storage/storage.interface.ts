export type StorageProviderName = 'local' | 's3' | 'gcs' | 'imagekit';
export type FileVisibility = 'public' | 'private';

export interface UploadInput {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
}

export interface UploadOptions {
    folder?: string;
    visibility?: FileVisibility;
    ext?: string | null;
}

export interface UploadResult {
    provider: StorageProviderName;
    bucket: string | null;
    key: string;
    url: string;
}

export interface StorageProvider {
    name: StorageProviderName;
    upload(input: UploadInput, options: UploadOptions, baseUrl: string): Promise<UploadResult>;
    delete?(key: string): Promise<void>;
}
