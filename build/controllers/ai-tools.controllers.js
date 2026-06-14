"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ai_meta_description_service_1 = require("../services/ai-meta-description.service");
const ai_tools_dto_1 = require("../dtos/ai-tools.dto");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class AiToolsController {
    constructor() {
        this.metaDescriptionService = new ai_meta_description_service_1.AiMetaDescriptionService();
        /**
         * POST /ai-tools/meta-description
         * Body: GenerateMetaDescriptionDto
         */
        this.generateMetaDescription = async (req, res, next) => {
            try {
                const dto = (0, class_transformer_1.plainToInstance)(ai_tools_dto_1.GenerateMetaDescriptionDto, req.body);
                const errors = await (0, class_validator_1.validate)(dto);
                if (errors.length > 0) {
                    const messages = errors
                        .map((e) => { var _a; return Object.values((_a = e.constraints) !== null && _a !== void 0 ? _a : {}).join(", "); })
                        .join("; ");
                    throw new HttpException_1.default(400, messages);
                }
                const result = await this.metaDescriptionService.generate({
                    content: dto.content,
                    focusKeyword: dto.focusKeyword,
                    tone: dto.tone,
                    maxLength: dto.maxLength,
                });
                res.status(200).json({
                    success: true,
                    message: "Meta description generated successfully",
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = AiToolsController;
//# sourceMappingURL=ai-tools.controllers.js.map