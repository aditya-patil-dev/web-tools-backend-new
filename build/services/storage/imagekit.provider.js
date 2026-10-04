"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageKitProvider = void 0;
const imagekit_1 = __importDefault(require("imagekit"));
const uuid_1 = require("uuid");
function getImageKit() {
    return new imagekit_1.default({
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "dummy_public_key",
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "dummy_private_key",
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/dummy",
    });
}
class ImageKitProvider {
    constructor() {
        this.name = "imagekit";
    }
    async upload(input, options, baseUrl) {
        var _a, _b;
        const fileName = `${(0, uuid_1.v4)()}.${(_a = options.ext) !== null && _a !== void 0 ? _a : "bin"}`;
        const imagekit = getImageKit();
        const result = await imagekit.upload({
            file: input.buffer,
            fileName,
            folder: (_b = options.folder) !== null && _b !== void 0 ? _b : "uploads",
            useUniqueFileName: false,
        });
        return {
            provider: "imagekit",
            bucket: null,
            key: result.filePath,
            url: result.url,
        };
    }
}
exports.ImageKitProvider = ImageKitProvider;
//# sourceMappingURL=imagekit.provider.js.map