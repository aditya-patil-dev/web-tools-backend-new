// src/services/seo-metrics/seo-metrics.interface.ts

export type SeoMetricsProviderName = 'none' | 'dataforseo' | 'keywordseverywhere' | 'serpapi';

export type CompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface KeywordMetricsItem {
  keyword: string;
  search_volume: number | null;
  cpc: number | null;
  difficulty: number | null; // 0 - 100
  competition: number | null; // 0 - 1 (Google Ads competition index)
  competition_level: CompetitionLevel | null;
  monthly_searches?: {
    year: number;
    month: number;
    search_volume: number;
  }[];
}

export interface SeoMetricsProvider {
  readonly name: SeoMetricsProviderName;

  /**
   * Checks if this provider is currently enabled and has valid API configuration.
   */
  isEnabled(): boolean;

  /**
   * Fetches search volume, CPC, and competition metrics for a list of keywords.
   * Returns a Map where the key is the lowercase keyword.
   */
  fetchMetrics(
    keywords: string[],
    country: string,
    language: string
  ): Promise<Map<string, KeywordMetricsItem>>;
}
