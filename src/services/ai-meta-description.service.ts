import { AIEngine } from "../ai";
import HttpException from "../exceptions/HttpException";

interface MetaDescriptionInput {
    content: string;
    focusKeyword?: string;
    tone?: "formal" | "casual" | "professional" | "persuasive";
    maxLength?: number;
}

interface MetaDescriptionOutput {
    metaDescription: string;
    characterCount: number;
    provider: string;
    model: string;
    seoScore: {
        score: number;
        feedback: string[];
    };
}

/**
 * AiMetaDescriptionService
 *
 * Uses the centralized AIEngine to generate SEO meta descriptions.
 * To use a different AI provider, change AI_PROVIDER in .env — no code change here.
 */
export class AiMetaDescriptionService {
    private engine = AIEngine.getInstance();

    async generate(input: MetaDescriptionInput): Promise<MetaDescriptionOutput> {
        const maxLen = input.maxLength ?? 155;
        const tone = input.tone ?? "professional";

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
            throw new HttpException(502, "AI returned an invalid meta description");
        }

        // Trim to max length at word boundary if the AI overshoots
        const metaDescription =
            raw.length <= maxLen ? raw : this.trimToWordBoundary(raw, maxLen);

        return {
            metaDescription,
            characterCount: metaDescription.length,
            provider: result.provider,
            model: result.model,
            seoScore: this.scoreSeoQuality(metaDescription, input.focusKeyword, maxLen),
        };
    }

    private buildUserPrompt(input: MetaDescriptionInput, maxLen: number): string {
        const lines = [
            `Page content:\n${input.content}`,
            input.focusKeyword
                ? `Focus keyword: "${input.focusKeyword}"`
                : null,
            `Max length: ${maxLen} characters`,
        ].filter(Boolean);

        return lines.join("\n\n");
    }

    private trimToWordBoundary(text: string, max: number): string {
        const truncated = text.slice(0, max);
        const lastSpace = truncated.lastIndexOf(" ");
        return lastSpace > 0 ? truncated.slice(0, lastSpace) + "..." : truncated;
    }

    private scoreSeoQuality(
        description: string,
        focusKeyword?: string,
        maxLen = 155,
    ): { score: number; feedback: string[] } {
        const feedback: string[] = [];
        let score = 100;
        const len = description.length;

        // Length check
        if (len < 50) {
            score -= 30;
            feedback.push("Too short — aim for at least 50 characters");
        } else if (len < 120) {
            score -= 10;
            feedback.push("Consider a longer description (120–155 chars is ideal)");
        } else if (len > maxLen) {
            score -= 20;
            feedback.push(`Too long — exceeds ${maxLen} characters, may be truncated in SERPs`);
        } else {
            feedback.push("✓ Length is within the optimal range");
        }

        // Keyword check
        if (focusKeyword) {
            if (description.toLowerCase().includes(focusKeyword.toLowerCase())) {
                feedback.push("✓ Focus keyword is present");
            } else {
                score -= 20;
                feedback.push(`Focus keyword "${focusKeyword}" is missing`);
            }
        }

        // Action word check
        const actionWords = ["discover", "learn", "get", "find", "explore", "start", "boost", "improve", "create", "build"];
        const hasAction = actionWords.some((w) =>
            description.toLowerCase().includes(w),
        );
        if (hasAction) {
            feedback.push("✓ Contains an action-oriented word");
        } else {
            score -= 5;
            feedback.push("Consider adding an action word (e.g. Discover, Learn, Get)");
        }

        return { score: Math.max(0, score), feedback };
    }
}