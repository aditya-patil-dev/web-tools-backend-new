"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiMetaDescriptionService = void 0;
const ai_1 = require("../ai");
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
/**
 * AiMetaDescriptionService
 *
 * Uses the centralized AIEngine to generate SEO meta descriptions.
 * To use a different AI provider, change AI_PROVIDER in .env — no code change here.
 */
class AiMetaDescriptionService {
    constructor() {
        this.engine = ai_1.AIEngine.getInstance();
    }
    async generate(input) {
        var _a, _b;
        const maxLen = (_a = input.maxLength) !== null && _a !== void 0 ? _a : 155;
        const tone = (_b = input.tone) !== null && _b !== void 0 ? _b : "professional";
        const systemPrompt = `You are an expert SEO copywriter.
            Your task is to write compelling, concise meta descriptions for web pages.
            Rules:
            - Must be between 50 and ${maxLen} characters (strictly enforced)
            - Must accurately summarize the page content
            - Should include the focus keyword naturally if provided
            - Tone: ${tone}
            - Do NOT use quotes, markdown, or any formatting
            - Output ONLY the meta description text — nothing else`;
        const userPrompt = this.buildUserPrompt(input, maxLen);
        const result = await this.engine.prompt(userPrompt, systemPrompt, {
            temperature: 0.6,
            maxTokens: 300,
        });
        const raw = result.content.trim().replace(/^["']|["']$/g, "");
        if (!raw || raw.length < 10) {
            throw new HttpException_1.default(502, "AI returned an invalid meta description");
        }
        // Trim to max length at word boundary if the AI overshoots
        const metaDescription = raw.length <= maxLen ? raw : this.trimToWordBoundary(raw, maxLen);
        return {
            metaDescription,
            characterCount: metaDescription.length,
            provider: result.provider,
            model: result.model,
            seoScore: this.scoreSeoQuality(metaDescription, input.focusKeyword, maxLen),
        };
    }
    buildUserPrompt(input, maxLen) {
        const lines = [
            `Page content:\n${input.content}`,
            input.focusKeyword
                ? `Focus keyword: "${input.focusKeyword}"`
                : null,
            `Max length: ${maxLen} characters`,
        ].filter(Boolean);
        return lines.join("\n\n");
    }
    trimToWordBoundary(text, max) {
        const truncated = text.slice(0, max);
        const lastSpace = truncated.lastIndexOf(" ");
        return lastSpace > 0 ? truncated.slice(0, lastSpace) + "..." : truncated;
    }
    scoreSeoQuality(description, focusKeyword, maxLen = 155) {
        const feedback = [];
        let score = 100;
        const len = description.length;
        // Length check
        if (len < 50) {
            score -= 30;
            feedback.push("Too short — aim for at least 50 characters");
        }
        else if (len < 120) {
            score -= 10;
            feedback.push("Consider a longer description (120–155 chars is ideal)");
        }
        else if (len > maxLen) {
            score -= 20;
            feedback.push(`Too long — exceeds ${maxLen} characters, may be truncated in SERPs`);
        }
        else {
            feedback.push("✓ Length is within the optimal range");
        }
        // Keyword check
        if (focusKeyword) {
            if (description.toLowerCase().includes(focusKeyword.toLowerCase())) {
                feedback.push("✓ Focus keyword is present");
            }
            else {
                score -= 20;
                feedback.push(`Focus keyword "${focusKeyword}" is missing`);
            }
        }
        // Action word check
        const actionWords = ["discover", "learn", "get", "find", "explore", "start", "boost", "improve", "create", "build"];
        const hasAction = actionWords.some((w) => description.toLowerCase().includes(w));
        if (hasAction) {
            feedback.push("✓ Contains an action-oriented word");
        }
        else {
            score -= 5;
            feedback.push("Consider adding an action word (e.g. Discover, Learn, Get)");
        }
        return { score: Math.max(0, score), feedback };
    }
}
exports.AiMetaDescriptionService = AiMetaDescriptionService;
//# sourceMappingURL=ai-meta-description.service.js.map