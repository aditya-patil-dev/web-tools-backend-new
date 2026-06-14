"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const HttpException_1 = __importDefault(require("../../exceptions/HttpException"));
class GeminiProvider {
    constructor() {
        this.name = "gemini";
        this.defaultModel = "gemini-2.5-flash";
        this.baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        const key = process.env.GEMINI_API_KEY;
        if (!key)
            throw new Error("GEMINI_API_KEY is not set in environment");
        this.apiKey = key;
    }
    async complete(request) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const model = (_a = request.model) !== null && _a !== void 0 ? _a : this.defaultModel;
        // Gemini uses a different message format — map OpenAI-style messages
        const contents = request.messages
            .filter((m) => m.role !== "system")
            .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));
        // Gemini handles system prompts via systemInstruction
        const systemMessage = request.messages.find((m) => m.role === "system");
        const systemInstruction = systemMessage
            ? { parts: [{ text: systemMessage.content }] }
            : undefined;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`, Object.assign(Object.assign({ contents }, (systemInstruction ? { systemInstruction } : {})), { generationConfig: {
                    temperature: (_b = request.temperature) !== null && _b !== void 0 ? _b : 0.7,
                    maxOutputTokens: (_c = request.maxTokens) !== null && _c !== void 0 ? _c : 1024,
                    topP: (_d = request.topP) !== null && _d !== void 0 ? _d : 1,
                } }), {
                headers: { "Content-Type": "application/json" },
                timeout: 30000,
            });
            const candidate = (_e = response.data.candidates) === null || _e === void 0 ? void 0 : _e[0];
            const text = (_h = (_g = (_f = candidate === null || candidate === void 0 ? void 0 : candidate.content) === null || _f === void 0 ? void 0 : _f.parts) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.text;
            if (!text) {
                throw new HttpException_1.default(502, "Gemini returned an empty response");
            }
            const usage = response.data.usageMetadata;
            return {
                content: text.trim(),
                provider: this.name,
                model,
                usage: usage
                    ? {
                        promptTokens: (_j = usage.promptTokenCount) !== null && _j !== void 0 ? _j : 0,
                        completionTokens: (_k = usage.candidatesTokenCount) !== null && _k !== void 0 ? _k : 0,
                        totalTokens: (_l = usage.totalTokenCount) !== null && _l !== void 0 ? _l : 0,
                    }
                    : undefined,
            };
        }
        catch (err) {
            if (err instanceof HttpException_1.default)
                throw err;
            const status = (_m = err.response) === null || _m === void 0 ? void 0 : _m.status;
            const message = (_s = (_r = (_q = (_p = (_o = err.response) === null || _o === void 0 ? void 0 : _o.data) === null || _p === void 0 ? void 0 : _p.error) === null || _q === void 0 ? void 0 : _q.message) !== null && _r !== void 0 ? _r : err.message) !== null && _s !== void 0 ? _s : "Unknown error";
            if (status === 400)
                throw new HttpException_1.default(400, `Gemini: Bad request — ${message}`);
            if (status === 403)
                throw new HttpException_1.default(502, "Gemini: Invalid API key or permission denied");
            if (status === 429)
                throw new HttpException_1.default(429, "Gemini: Rate limit exceeded");
            if (status === 503)
                throw new HttpException_1.default(503, "Gemini: Service temporarily unavailable");
            throw new HttpException_1.default(502, `Gemini API error: ${message}`);
        }
    }
}
exports.GeminiProvider = GeminiProvider;
//# sourceMappingURL=gemini.provider.js.map