"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const HttpException_1 = __importDefault(require("../../exceptions/HttpException"));
/**
 * OllamaProvider
 *
 * Standard local offline LLM provider running on http://localhost:11434
 * 100% Free with ZERO rate limits!
 *
 * Make sure Ollama is installed and running locally:
 *   1. Download Ollama from https://ollama.com
 *   2. Run command: ollama pull llama3   (or qwen2.5)
 */
class OllamaProvider {
    constructor() {
        this.name = "ollama";
        this.defaultModel = "llama3"; // can also use qwen2.5, gemma2, etc.
        this.baseUrl = "http://localhost:11434/v1";
    }
    async complete(request) {
        var _a, _b, _c, _d, _e, _f, _g;
        const model = (_a = request.model) !== null && _a !== void 0 ? _a : this.defaultModel;
        try {
            const response = await axios_1.default.post(`${this.baseUrl}/chat/completions`, {
                model,
                messages: request.messages,
                temperature: (_b = request.temperature) !== null && _b !== void 0 ? _b : 0.7,
                max_tokens: (_c = request.maxTokens) !== null && _c !== void 0 ? _c : 2048,
                top_p: (_d = request.topP) !== null && _d !== void 0 ? _d : 1,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 120000, // Local generation can take longer depending on hardware
            });
            const choice = (_e = response.data.choices) === null || _e === void 0 ? void 0 : _e[0];
            const usage = response.data.usage;
            if (!((_f = choice === null || choice === void 0 ? void 0 : choice.message) === null || _f === void 0 ? void 0 : _f.content)) {
                throw new HttpException_1.default(502, "Ollama returned an empty response");
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
            const message = (_g = err.message) !== null && _g !== void 0 ? _g : "Unknown error";
            throw new HttpException_1.default(502, `Ollama Local Connection Error: ${message}. Make sure Ollama is running locally and model "${model}" is downloaded via "ollama pull ${model}".`);
        }
    }
}
exports.OllamaProvider = OllamaProvider;
//# sourceMappingURL=ollama.provider.js.map