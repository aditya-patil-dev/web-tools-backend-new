import { Request, Response } from 'express';
import { UploadService } from '../services/upload.services';

class UploadController {
    private uploadService = new UploadService();

    public upload = async (req: Request, res: Response): Promise<void> => {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'File is required' });
            return;
        }

        // Works in local + prod without env:
        const baseUrl = `${req.protocol}://${req.get('host')}`;

        const visibility = (req.body.visibility as 'public' | 'private' | undefined) ?? 'public';
        const folder = (req.body.folder as string | undefined) ?? 'uploads';

        const uploadedBy = req.user?.sub ?? null;

        const created = await this.uploadService.uploadFile({
            file,
            baseUrl,
            uploadedBy,
            visibility,
            folder,
        });

        res.status(201).json({
            message: 'Uploaded',
            file: {
                id: created.id,
                url: created.url,
                provider: created.provider,
                key: created.key,
                mime_type: created.mime_type,
                size_bytes: created.size_bytes,
                original_name: created.original_name,
                visibility: created.visibility,
                created_at: created.created_at,
            },
        });
    };
}

export default UploadController;