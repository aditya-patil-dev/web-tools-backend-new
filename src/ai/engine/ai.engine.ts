import { AIProvider, AICompletionRequest, AICompletionResponse } from "../interfaces/ai-provider.interface";
import { AIProviderFactory, AIProviderName } from "../factory/ai-provider.factory";

/**
 * AIEngine — Centralized Generic AI Engine
 *
 * Single entry point for all AI operations across the entire backend.
 * All tool services should use this engine instead of calling providers directly.
 *
 * Usage:
 *   const engine = AIEngine.getInstance();
 *   const result = await engine.complete({ messages: [...] });
 *
 * To switch provider at runtime:
 *   const engine = AIEngine.getInstance();
 *   engine.switchProvider("openai");
 */
export class AIEngine {
    private static instance: AIEngine;
    private provider: AIProvider;

    private constructor() {
        this.provider = AIProviderFactory.create();
    }

    /**
     * Singleton — one engine instance per process.
     * Keeps a single provider configuration throughout the app lifecycle.
     */
    static getInstance(): AIEngine {
        if (!AIEngine.instance) {
            AIEngine.instance = new AIEngine();
        }
        return AIEngine.instance;
    }

    /**
     * Switch the underlying provider at runtime.
     * Useful for A/B testing or admin-driven configuration.
     */
    switchProvider(provider: AIProviderName): void {
        this.provider = AIProviderFactory.create(provider);
    }

    /**
     * Returns the name of the currently active provider.
     */
    getActiveProvider(): string {
        return this.provider.name;
    }

    /**
     * Core method — send a completion request to the active AI provider.
     * All tool services should call this.
     */
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
        return this.provider.complete(request);
    }

    /**
     * Convenience: single user prompt with an optional system instruction.
     */
    async prompt(
        userMessage: string,
        systemInstruction?: string,
        options?: Partial<Omit<AICompletionRequest, "messages">>,
    ): Promise<AICompletionResponse> {
        return this.complete({
            messages: [
                ...(systemInstruction
                    ? [{ role: "system" as const, content: systemInstruction }]
                    : []),
                { role: "user" as const, content: userMessage },
            ],
            ...options,
        });
    }
}