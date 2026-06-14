"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageProvider = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const crypto_1 = __importDefault(require("crypto"));
function safeExtFromName(name) {
    const ext = path_1.default.extname(name || '').toLowerCase().replace('.', '');
    return ext ? ext : null;
}
function nowPathPrefix() {
    const d = new Date();
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    return `${yyyy}/${mm}`;
}
class LocalStorageProvider {
    constructor() {
        this.name = 'local';
    }
    async upload(input, options, baseUrl) {
        var _a, _b;
        const uploadsRoot = path_1.default.resolve(process.cwd(), 'src', 'uploads');
        const ext = (_a = options.ext) !== null && _a !== void 0 ? _a : safeExtFromName(input.originalName);
        const folder = (_b = options.folder) !== null && _b !== void 0 ? _b : 'uploads';
        const random = crypto_1.default.randomBytes(16).toString('hex');
        const key = `${folder}/${nowPathPrefix()}/${random}${ext ? `.${ext}` : ''}`;
        const absPath = path_1.default.join(uploadsRoot, key);
        await promises_1.default.mkdir(path_1.default.dirname(absPath), { recursive: true });
        await promises_1.default.writeFile(absPath, input.buffer);
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
exports.LocalStorageProvider = LocalStorageProvider;
//# sourceMappingURL=local.storage.js.map