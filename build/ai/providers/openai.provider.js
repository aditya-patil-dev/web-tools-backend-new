"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const HttpException_1 = __importDefault(require("../../exceptions/HttpException"));
class OpenAIProvider {
    constructor() {
        this.name = "openai";
        this.defaultModel = "gpt-4o-mini";
        this.baseUrl = "https://api.openai.com/v1";
        const key = process.env.OPENAI_API_KEY;
        if (!key)
            throw new Error("OPENAI_API_KEY is not set in environment");
        this.apiKey = key;
    }
    async complete(request) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const model = (_a = request.model) !== null && _a !== void 0 ? _a : this.defaultModel;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model,
                messages: request.messages,
                temperature: (_b = request.temperature) !== null && _b !== void 0 ? _b : 0.7,
                max_tokens: (_c = request.maxTokens) !== null && _c !== void 0 ? _c : 1024,
                top_p: (_d = request.topP) !== null && _d !== void 0 ? _d : 1,
            }, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    "Content-Type": "application/json",
                },
                timeout: 30000,
            });
            const choice = (_e = response.data.choices) === null || _e === void 0 ? void 0 : _e[0];
            const usage = response.data.usage;
            if (!((_f = choice === null || choice === void 0 ? void 0 : choice.message) === null || _f === void 0 ? void 0 : _f.content)) {
                throw new HttpException_1.default(502, "OpenAI returned an empty response");
            }
            return {
                content: choice.message.content.trim(),
                provider: this.name,
                model,
                usage: usage
                    ? {
                        promptTokens: usage.prompt_tokens,
                        completionTokens: usage.completion_tokens,
                        totalTokens: usage.total_tokens,
                    }
                    : undefined,
            };
        }
        catch (err) {
            if (err instanceof HttpException_1.default)
                throw err;
            const status = (_g = err.response) === null || _g === void 0 ? void 0 : _g.status;
            const message = (_m = (_l = (_k = (_j = (_h = err.response) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.error) === null || _k === void 0 ? void 0 : _k.message) !== null && _l !== void 0 ? _l : err.message) !== null && _m !== void 0 ? _m : "Unknown error";
            if (status === 401)
                throw new HttpException_1.default(502, "OpenAI: Invalid API key");
            if (status === 429)
                throw new HttpException_1.default(429, "OpenAI: Rate limit exceeded");
            if (status === 503)
                throw new HttpException_1.default(503, "OpenAI: Service temporarily unavailable");
            throw new HttpException_1.default(502, `OpenAI API error: ${message}`);
        }
    }
}
exports.OpenAIProvider = OpenAIProvider;
//# sourceMappingURL=openai.provider.js.map