// src/services/seo-metrics/serpapi.provider.ts
import axios from "axios";
import {
  SeoMetricsProvider,
  SeoMetricsProviderName,
  KeywordMetricsItem,
  CompetitionLevel,
} from "./seo-metrics.interface";

/**
 * SerpApi Provider (Approach B - SerpApi)
 *
 * Connects to SerpApi (serpapi.com).
 * Requires SERPAPI_API_KEY in .env.
 * Docs: https://serpapi.com/search-api
 */
export class SerpApiProvider implements SeoMetricsProvider {
  public readonly name: SeoMetricsProviderName = "serpapi";

  private readonly apiKey: string | undefined;
  private readonly endpoint = "https://serpapi.com/search.json";

  constructor() {
    this.apiKey = process.env.SERPAPI_API_KEY;
  }

  public isEnabled(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async fetchMetrics(
    keywords: string[],
    country: string = "us",
    language: string = "en"
  ): Promise<Map<string, KeywordMetricsItem>> {
    const resultsMap = new Map<string, KeywordMetricsItem>();

    if (!this.isEnabled() || keywords.length === 0) {
      return resultsMap;
    }

    try {
      // SerpApi processes search queries per term or autocomplete batch
      // For efficiency, we inspect top keywords in parallel with concurrency limit
      const topKeywords = keywords.slice(0, 15);

      const promises = topKeywords.map(async (kw) => {
        try {
          const response = await axios.get(this.endpoint, {
            params: {
              engine: "google",
              q: kw,
              gl: country.toLowerCase(),
              hl: language.toLowerCase(),
              api_key: this.apiKey,
            },
            timeout: 10000,
          });

          const data = response.data;
          const searchInformation = data?.search_information || {};
          const totalResults = searchInformation?.total_results;

          // Estimate competition / difficulty based on total SERP results count and ad presence
          let competition: number | null = null;
          let difficulty: number | null = null;
          let competitionLevel: CompetitionLevel = "LOW";

          if (typeof totalResults === "number" && totalResults > 0) {
            // Logarithmic scale for SERP competition
            const logResults = Math.log10(totalResults);
            difficulty = Math.min(100, Math.max(10, Math.round(logResults * 10)));
            competition = Number((difficulty / 100).toFixed(2));

            if (difficulty >= 70) competitionLevel = "HIGH";
            else if (difficulty >= 40) competitionLevel = "MEDIUM";
            else competitionLevel = "LOW";
          }

          const adsCount = Array.isArray(data?.ads) ? data.ads.length : 0;
          if (adsCount > 2) {
            competitionLevel = "HIGH";
          }

          resultsMap.set(kw.toLowerCase().trim(), {
            keyword: kw,
            search_volume: null, // SerpApi standard search does not return volume without keyword planner add-on
            cpc: null,
            difficulty,
            competition,
            competition_level: competitionLevel,
          });
        } catch {
          // Non-fatal per-keyword failure
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("[SerpApiProvider] Failed to fetch SerpApi data:", error);
    }

    return resultsMap;
  }
}
