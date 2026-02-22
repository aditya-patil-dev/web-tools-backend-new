import path from 'path';
import db, { T } from '../database/index.schema';
import { getStorageProvider } from './storage/storage.factory';
import { FileVisibility } from './storage/storage.interface';

function getExt(originalName: string): string | null {
    const ext = path.extname(originalName || '').toLowerCase().replace('.', '');
    return ext ? ext : null;
}

export class UploadService {
    public async uploadFile(params: {
        file: Express.Multer.File;
        baseUrl: string;
        uploadedBy?: string | null;
        visibility?: FileVisibility;
        folder?: string;
    }) {
        const { file, baseUrl, uploadedBy, visibility = 'public', folder } = params;

        const provider = getStorageProvider();

        const result = await provider.upload(
            {
                buffer: file.buffer,
                originalName: file.originalname,
                mimeType: file.mimetype,
                sizeBytes: file.size,
            },
            {
                folder: folder ?? 'uploads',
                visibility,
                ext: getExt(file.originalname),
            },
            baseUrl
        );

        const record = {
            provider: result.provider,
            bucket: result.bucket,
            key: result.key,
            url: result.url,
            original_name: file.originalname,
            mime_type: file.mimetype,
            size_bytes: file.size,
            ext: getExt(file.originalname),
            visibility,
            uploaded_by: uploadedBy ?? null,
        };

        const [created] = await db(T.FILES).insert(record).returning('*');
        return created;
    }
}
