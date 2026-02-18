import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { StorageProvider, UploadInput, UploadOptions, UploadResult } from './storage.interface';

function safeExtFromName(name: string): string | null {
    const ext = path.extname(name || '').toLowerCase().replace('.', '');
    return ext ? ext : null;
}

function nowPathPrefix(): string {
    const d = new Date();
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${yyyy}/${mm}`;
}

export class LocalStorageProvider implements StorageProvider {
    public name = 'local' as const;

    public async upload(
        input: UploadInput,
        options: UploadOptions,
        baseUrl: string
    ): Promise<UploadResult> {
        const uploadsRoot = path.resolve(process.cwd(), 'src', 'uploads');

        const ext = options.ext ?? safeExtFromName(input.originalName);
        const folder = options.folder ?? 'uploads';

        const random = crypto.randomBytes(16).toString('hex');
        const key = `${folder}/${nowPathPrefix()}/${random}${ext ? `.${ext}` : ''}`;

        const absPath = path.join(uploadsRoot, key);

        await fs.mkdir(path.dirname(absPath), { recursive: true });

        await fs.writeFile(absPath, input.buffer);

        const publicPath = `/${key.replace(/^uploads\//, 'uploads/')}`;
        const url = `${baseUrl}${publicPath}`;

        return {
            provider: 'local',
            bucket: null,
            key,
            url,
        };
    }
}
