import axios from "axios";
import {
    AIProvider,
    AICompletionRequest,
    AICompletionResponse,
} from "../interfaces/ai-provider.interface";
import HttpException from "../../exceptions/HttpException";

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
export class OllamaProvider implements AIProvider {
    readonly name = "ollama";
    readonly defaultModel = "llama3"; // can also use qwen2.5, gemma2, etc.

    private readonly baseUrl = "http://localhost:11434/v1";

    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
        const model = request.model ?? this.defaultModel;

        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model,
                    messages: request.messages,
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens ?? 2048,
                    top_p: request.topP ?? 1,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 120_000, // Local generation can take longer depending on hardware
                }
            );

            const choice = response.data.choices?.[0];
            const usage = response.data.usage;

            if (!choice?.message?.content) {
                throw new HttpException(502, "Ollama returned an empty response");
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
        } catch (err: any) {
            if (err instanceof HttpException) throw err;

            const message = err.message ?? "Unknown error";
            throw new HttpException(
                502,
                `Ollama Local Connection Error: ${message}. Make sure Ollama is running locally and model "${model}" is downloaded via "ollama pull ${model}".`
            );
        }
    }
}
