// src/services/seo-metrics/dataforseo.provider.ts
import axios from "axios";
import {
  SeoMetricsProvider,
  SeoMetricsProviderName,
  KeywordMetricsItem,
  CompetitionLevel,
} from "./seo-metrics.interface";

/**
 * DataForSEO Provider (Approach B - Ready)
 *
 * Connects to DataForSEO v3 Google Ads Search Volume Live API.
 * Requires DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env.
 * Docs: https://docs.dataforseo.com/v3/keywords_data/google_ads/search_volume/live/
 */
export class DataForSeoProvider implements SeoMetricsProvider {
  public readonly name: SeoMetricsProviderName = "dataforseo";

  private readonly login: string | undefined;
  private readonly password: string | undefined;
  private readonly endpoint = "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live";

  constructor() {
    this.login = process.env.DATAFORSEO_LOGIN;
    this.password = process.env.DATAFORSEO_PASSWORD;
  }

  public isEnabled(): boolean {
    return Boolean(this.login && this.password && this.login.trim() && this.password.trim());
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
      const auth = Buffer.from(`${this.login}:${this.password}`).toString("base64");

      // DataForSEO accepts up to 700 keywords per task. Chunk if needed.
      const CHUNK_SIZE = 700;
      const chunks: string[][] = [];
      for (let i = 0; i < keywords.length; i += CHUNK_SIZE) {
        chunks.push(keywords.slice(i, i + CHUNK_SIZE));
      }

      for (const chunk of chunks) {
        const payload = [
          {
            keywords: chunk,
            location_code: this.mapCountryToLocationCode(country),
            language_code: language,
          },
        ];

        const response = await axios.post(this.endpoint, payload, {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        });

        const tasks = response.data?.tasks || [];
        for (const task of tasks) {
          const items = task.result || [];
          for (const item of items) {
            const kw = (item.keyword || "").toLowerCase().trim();
            if (!kw) continue;

            const competitionLevel = (item.competition_level || null) as CompetitionLevel | null;
            const competitionIndex = typeof item.competition_index === "number" ? item.competition_index : null;
            
            // Keyword Difficulty estimated from competition_index (0-100)
            const difficulty = competitionIndex !== null ? Math.round(competitionIndex) : null;

            resultsMap.set(kw, {
              keyword: item.keyword,
              search_volume: typeof item.search_volume === "number" ? item.search_volume : null,
              cpc: typeof item.cpc === "number" ? Number(item.cpc.toFixed(2)) : null,
              difficulty,
              competition: typeof item.competition === "number" ? Number(item.competition.toFixed(2)) : null,
              competition_level: competitionLevel,
              monthly_searches: Array.isArray(item.monthly_searches)
                ? item.monthly_searches.map((m: any) => ({
                    year: m.year,
                    month: m.month,
                    search_volume: m.search_volume,
                  }))
                : undefined,
            });
          }
        }
      }
    } catch (error) {
      console.error("[DataForSeoProvider] Failed to fetch keyword metrics:", error);
    }

    return resultsMap;
  }

  /**
   * Helper to map common ISO-2 country codes to DataForSEO country location codes
   */
  private mapCountryToLocationCode(country: string): number {
    const map: Record<string, number> = {
      us: 2840, // United States
      in: 2356, // India
      gb: 2826, // United Kingdom
      ca: 2124, // Canada
      au: 2036, // Australia
      de: 2276, // Germany
      fr: 2250, // France
      jp: 2392, // Japan
    };

    return map[country.toLowerCase()] || 2840;
  }
}
