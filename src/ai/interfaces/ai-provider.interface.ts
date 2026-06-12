export interface AIMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

export interface AICompletionRequest {
    messages: AIMessage[];
    temperature?: number;       // 0.0 – 2.0, defaults to 0.7
    maxTokens?: number;         // defaults to 1024
    topP?: number;
    model?: string;             // override the provider default model
}

export interface AICompletionResponse {
    content: string;
    provider: string;           // e.g. "deepseek" | "openai" | "gemini"
    model: string;              // exact model string used
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface AIProvider {
    readonly name: string;
    readonly defaultModel: string;
    complete(request: AICompletionRequest): Promise<AICompletionResponse>;
}