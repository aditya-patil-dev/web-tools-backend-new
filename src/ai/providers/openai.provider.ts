import axios from "axios";
import {
    AIProvider,
    AICompletionRequest,
    AICompletionResponse,
} from "../interfaces/ai-provider.interface";
import HttpException from "../../exceptions/HttpException";

export class OpenAIProvider implements AIProvider {
    readonly name = "openai";
    readonly defaultModel = "gpt-4o-mini";

    private readonly apiKey: string;
    private readonly baseUrl = "https://api.openai.com/v1";

    constructor() {
        const key = process.env.OPENAI_API_KEY;
        if (!key) throw new Error("OPENAI_API_KEY is not set in environment");
        this.apiKey = key;
    }

    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
        const model = request.model ?? this.defaultModel;

        try {
            const response = await axios.post(
                `${this.baseUrl}/chat/completions`,
                {
                    model,
                    messages: request.messages,
                    temperature: request.temperature ?? 0.7,
                    max_tokens: request.maxTokens ?? 1024,
                    top_p: request.topP ?? 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30_000,
                },
            );

            const choice = response.data.choices?.[0];
            const usage = response.data.usage;

            if (!choice?.message?.content) {
                throw new HttpException(502, "OpenAI returned an empty response");
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

            const status = err.response?.status;
            const message =
                err.response?.data?.error?.message ?? err.message ?? "Unknown error";

            if (status === 401) throw new HttpException(502, "OpenAI: Invalid API key");
            if (status === 429) throw new HttpException(429, "OpenAI: Rate limit exceeded");
            if (status === 503) throw new HttpException(503, "OpenAI: Service temporarily unavailable");

            throw new HttpException(502, `OpenAI API error: ${message}`);
        }
    }
}