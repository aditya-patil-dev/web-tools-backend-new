"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeywordsEverywhereProvider = void 0;
// src/services/seo-metrics/keywordseverywhere.provider.ts
const axios_1 = __importDefault(require("axios"));
/**
 * Keywords Everywhere Provider (Approach B - Alternative)
 *
 * Connects to Keywords Everywhere API v1.
 * Requires KEYWORDS_EVERYWHERE_API_KEY in .env.
 * Docs: https://keywordseverywhere.com/api.html
 */
class KeywordsEverywhereProvider {
    constructor() {
        this.name = "keywordseverywhere";
        this.endpoint = "https://api.keywordseverywhere.com/v1/get_keyword_data";
        this.apiKey = process.env.KEYWORDS_EVERYWHERE_API_KEY;
    }
    isEnabled() {
        return Boolean(this.apiKey && this.apiKey.trim().length > 0);
    }
    async fetchMetrics(keywords, country = "us", _language = "en") {
        var _a, _b;
        const resultsMap = new Map();
        if (!this.isEnabled() || keywords.length === 0) {
            return resultsMap;
        }
        try {
            // Keywords Everywhere allows up to 100 keywords per POST request
            const CHUNK_SIZE = 100;
            const chunks = [];
            for (let i = 0; i < keywords.length; i += CHUNK_SIZE) {
                chunks.push(keywords.slice(i, i + CHUNK_SIZE));
            }
            for (const chunk of chunks) {
                const formData = new URLSearchParams();
                formData.append("country", country.toLowerCase());
                formData.append("currency", "USD");
                chunk.forEach((kw) => formData.append("data[]", kw));
                const response = await axios_1.default.post(this.endpoint, formData.toString(), {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${this.apiKey}`,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    timeout: 15000,
                });
                const items = ((_a = response.data) === null || _a === void 0 ? void 0 : _a.data) || [];
                for (const item of items) {
                    const kw = (item.keyword || "").toLowerCase().trim();
                    if (!kw)
                        continue;
                    const competition = typeof item.competition === "number" ? item.competition : null;
                    let competitionLevel = null;
                    if (competition !== null) {
                        if (competition < 0.33)
                            competitionLevel = "LOW";
                        else if (competition < 0.66)
                            competitionLevel = "MEDIUM";
                        else
                            competitionLevel = "HIGH";
                    }
                    const cpcVal = ((_b = item.cpc) === null || _b === void 0 ? void 0 : _b.value) ? parseFloat(item.cpc.value) : null;
                    const difficulty = competition !== null ? Math.round(competition * 100) : null;
                    resultsMap.set(kw, {
                        keyword: item.keyword,
                        search_volume: typeof item.vol === "number" ? item.vol : null,
                        cpc: cpcVal !== null && !isNaN(cpcVal) ? Number(cpcVal.toFixed(2)) : null,
                        difficulty,
                        competition: competition !== null ? Number(competition.toFixed(2)) : null,
                        competition_level: competitionLevel,
                    });
                }
            }
        }
        catch (error) {
            console.error("[KeywordsEverywhereProvider] Failed to fetch metrics:", error);
        }
        return resultsMap;
    }
}
exports.KeywordsEverywhereProvider = KeywordsEverywhereProvider;
//# sourceMappingURL=keywordseverywhere.provider.js.map