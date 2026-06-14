"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const keyword_services_1 = __importDefault(require("../services/keyword.services"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class KeywordController {
    constructor() {
        this.KeywordService = new keyword_services_1.default();
        /**
         * POST /keyword/research
         */
        this.doKeywordResearch = async (req, res, next) => {
            try {
                const { query, language = "en", region = "us", depth = 1, include_questions = true, export_csv = false, filters = {}, } = req.body;
                // ── Validations ──────────────────────────────────────────
                if (!query || typeof query !== "string" || !query.trim()) {
                    throw new HttpException_1.default(400, "query is required");
                }
                if (![1, 2].includes(depth)) {
                    throw new HttpException_1.default(400, "depth must be 1 or 2");
                }
                if (typeof language !== "string" || language.length > 10) {
                    throw new HttpException_1.default(400, "Invalid language code");
                }
                if (typeof region !== "string" || region.length > 10) {
                    throw new HttpException_1.default(400, "Invalid region code");
                }
                // ── Call Service ─────────────────────────────────────────
                const data = await this.KeywordService.doKeywordResearch({
                    query: query.trim(),
                    language,
                    region,
                    depth,
                    include_questions,
                    export_csv,
                    filters,
                });
                res.status(200).json({
                    success: true,
                    message: "Keyword research completed successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.default = KeywordController;
//# sourceMappingURL=keyword.controllers.js.map