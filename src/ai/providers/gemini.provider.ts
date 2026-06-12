import axios from "axios";
import {
    AIProvider,
    AICompletionRequest,
    AICompletionResponse,
} from "../interfaces/ai-provider.interface";
import HttpException from "../../exceptions/HttpException";

export class GeminiProvider implements AIProvider {
    readonly name = "gemini";
    readonly defaultModel = "gemini-2.5-flash";

    private readonly apiKey: string;
    private readonly baseUrl =
        "https://generativelanguage.googleapis.com/v1beta";

    constructor() {
        const key = process.env.GEMINI_API_KEY;
        if (!key) throw new Error("GEMINI_API_KEY is not set in environment");
        this.apiKey = key;
    }

    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
        const model = request.model ?? this.defaultModel;

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
            const response = await axios.post(
                `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
                {
                    contents,
                    ...(systemInstruction ? { systemInstruction } : {}),
                    generationConfig: {
                        temperature: request.temperature ?? 0.7,
                        maxOutputTokens: request.maxTokens ?? 1024,
                        topP: request.topP ?? 1,
                    },
                },
                {
                    headers: { "Content-Type": "application/json" },
                    timeout: 30_000,
                },
            );

            const candidate = response.data.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;

            if (!text) {
                throw new HttpException(502, "Gemini returned an empty response");
            }

            const usage = response.data.usageMetadata;

            return {
                content: text.trim(),
                provider: this.name,
                model,
                usage: usage
                    ? {
                        promptTokens: usage.promptTokenCount ?? 0,
                        completionTokens: usage.candidatesTokenCount ?? 0,
                        totalTokens: usage.totalTokenCount ?? 0,
                    }
                    : undefined,
            };
        } catch (err: any) {
            if (err instanceof HttpException) throw err;

            const status = err.response?.status;
            const message =
                err.response?.data?.error?.message ?? err.message ?? "Unknown error";

            if (status === 400) throw new HttpException(400, `Gemini: Bad request — ${message}`);
            if (status === 403) throw new HttpException(502, "Gemini: Invalid API key or permission denied");
            if (status === 429) throw new HttpException(429, "Gemini: Rate limit exceeded");
            if (status === 503) throw new HttpException(503, "Gemini: Service temporarily unavailable");

            throw new HttpException(502, `Gemini API error: ${message}`);
        }
    }
}