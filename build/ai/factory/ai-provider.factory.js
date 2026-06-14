"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIProviderFactory = void 0;
const deepseek_provider_1 = require("../providers/deepseek.provider");
const openai_provider_1 = require("../providers/openai.provider");
const gemini_provider_1 = require("../providers/gemini.provider");
const ollama_provider_1 = require("../providers/ollama.provider");
/**
 * AIProviderFactory
 *
 * Reads AI_PROVIDER from env (defaults to "deepseek").
 * To switch models, just change the env variable — no code change needed.
 *
 * Supported values: deepseek | openai | gemini | ollama
 */
class AIProviderFactory {
    static create(provider) {
        var _a;
        const name = provider !== null && provider !== void 0 ? provider : ((_a = process.env.AI_PROVIDER) !== null && _a !== void 0 ? _a : "deepseek");
        switch (name) {
            case "deepseek":
                return new deepseek_provider_1.DeepSeekProvider();
            case "openai":
                return new openai_provider_1.OpenAIProvider();
            case "gemini":
                return new gemini_provider_1.GeminiProvider();
            case "ollama":
                return new ollama_provider_1.OllamaProvider();
            default:
                throw new Error(`Unknown AI provider: "${name}". Supported: deepseek, openai, gemini, ollama`);
        }
    }
}
exports.AIProviderFactory = AIProviderFactory;
//# sourceMappingURL=ai-provider.factory.js.map