"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIEngine = void 0;
const ai_provider_factory_1 = require("../factory/ai-provider.factory");
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
class AIEngine {
    constructor() {
        this.provider = ai_provider_factory_1.AIProviderFactory.create();
    }
    /**
     * Singleton — one engine instance per process.
     * Keeps a single provider configuration throughout the app lifecycle.
     */
    static getInstance() {
        if (!AIEngine.instance) {
            AIEngine.instance = new AIEngine();
        }
        return AIEngine.instance;
    }
    /**
     * Switch the underlying provider at runtime.
     * Useful for A/B testing or admin-driven configuration.
     */
    switchProvider(provider) {
        this.provider = ai_provider_factory_1.AIProviderFactory.create(provider);
    }
    /**
     * Returns the name of the currently active provider.
     */
    getActiveProvider() {
        return this.provider.name;
    }
    /**
     * Core method — send a completion request to the active AI provider.
     * All tool services should call this.
     */
    async complete(request) {
        return this.provider.complete(request);
    }
    /**
     * Convenience: single user prompt with an optional system instruction.
     */
    async prompt(userMessage, systemInstruction, options) {
        return this.complete(Object.assign({ messages: [
                ...(systemInstruction
                    ? [{ role: "system", content: systemInstruction }]
                    : []),
                { role: "user", content: userMessage },
            ] }, options));
    }
}
exports.AIEngine = AIEngine;
//# sourceMappingURL=ai.engine.js.map