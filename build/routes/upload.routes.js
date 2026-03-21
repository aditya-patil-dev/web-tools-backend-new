"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const upload_controllers_1 = __importDefault(require("../controllers/upload.controllers"));
const validation_middleware_1 = __importDefault(require("../middlewares/validation.middleware"));
const upload_dto_1 = require("../dtos/upload.dto");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
class UploadRoute {
    constructor() {
        this.path = '/uploads';
        this.router = (0, express_1.Router)();
        this.uploadController = new upload_controllers_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', upload.single('file'), (0, validation_middleware_1.default)(upload_dto_1.UploadMetaDto, 'body', true, []), this.uploadController.upload);
    }
}
exports.default = UploadRoute;
//# sourceMappingURL=upload.routes.js.map