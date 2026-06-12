import { AIProvider } from "../interfaces/ai-provider.interface";
import { DeepSeekProvider } from "../providers/deepseek.provider";
import { OpenAIProvider } from "../providers/openai.provider";
import { GeminiProvider } from "../providers/gemini.provider";
import { OllamaProvider } from "../providers/ollama.provider";

export type AIProviderName = "deepseek" | "openai" | "gemini" | "ollama";

/**
 * AIProviderFactory
 *
 * Reads AI_PROVIDER from env (defaults to "deepseek").
 * To switch models, just change the env variable — no code change needed.
 *
 * Supported values: deepseek | openai | gemini | ollama
 */
export class AIProviderFactory {
    static create(provider?: AIProviderName): AIProvider {
        const name: AIProviderName =
            provider ??
            ((process.env.AI_PROVIDER ?? "deepseek") as AIProviderName);

        switch (name) {
            case "deepseek":
                return new DeepSeekProvider();
            case "openai":
                return new OpenAIProvider();
            case "gemini":
                return new GeminiProvider();
            case "ollama":
                return new OllamaProvider();
            default:
                throw new Error(
                    `Unknown AI provider: "${name}". Supported: deepseek, openai, gemini, ollama`,
                );
        }
    }
}