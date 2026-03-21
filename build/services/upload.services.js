"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const path_1 = __importDefault(require("path"));
const index_schema_1 = __importStar(require("../database/index.schema"));
const storage_factory_1 = require("./storage/storage.factory");
function getExt(originalName) {
    const ext = path_1.default.extname(originalName || '').toLowerCase().replace('.', '');
    return ext ? ext : null;
}
class UploadService {
    async uploadFile(params) {
        const { file, baseUrl, uploadedBy, visibility = 'public', folder } = params;
        const provider = (0, storage_factory_1.getStorageProvider)();
        const result = await provider.upload({
            buffer: file.buffer,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
        }, {
            folder: folder !== null && folder !== void 0 ? folder : 'uploads',
            visibility,
            ext: getExt(file.originalname),
        }, baseUrl);
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
            uploaded_by: uploadedBy !== null && uploadedBy !== void 0 ? uploadedBy : null,
        };
        const [created] = await (0, index_schema_1.default)(index_schema_1.T.FILES).insert(record).returning('*');
        return created;
    }
}
exports.UploadService = UploadService;
//# sourceMappingURL=upload.services.js.map