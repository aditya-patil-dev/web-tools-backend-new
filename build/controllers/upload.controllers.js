"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upload_services_1 = require("../services/upload.services");
class UploadController {
    constructor() {
        this.uploadService = new upload_services_1.UploadService();
        this.upload = async (req, res) => {
            var _a, _b, _c, _d;
            const file = req.file;
            if (!file) {
                res.status(400).json({ message: 'File is required' });
                return;
            }
            // Works in local + prod without env:
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const visibility = (_a = req.body.visibility) !== null && _a !== void 0 ? _a : 'public';
            const folder = (_b = req.body.folder) !== null && _b !== void 0 ? _b : 'uploads';
            const uploadedBy = (_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c.sub) !== null && _d !== void 0 ? _d : null;
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
}
exports.default = UploadController;
//# sourceMappingURL=upload.controllers.js.map