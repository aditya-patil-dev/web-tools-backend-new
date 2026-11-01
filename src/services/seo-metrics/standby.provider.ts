// src/services/seo-metrics/standby.provider.ts
import {
  SeoMetricsProvider,
  SeoMetricsProviderName,
  KeywordMetricsItem,
} from "./seo-metrics.interface";

/**
 * Standby Provider (Approach B - Idle)
 *
 * Used when no paid SEO API (like DataForSEO or Keywords Everywhere) is configured.
 * Does not make external network requests and incurs 0 cost.
 */
export class StandbySeoMetricsProvider implements SeoMetricsProvider {
  public readonly name: SeoMetricsProviderName = "none";

  public isEnabled(): boolean {
    return false;
  }

  public async fetchMetrics(
    _keywords: string[],
    _country: string,
    _language: string
  ): Promise<Map<string, KeywordMetricsItem>> {
    // Returns an empty map; consumer will default metrics fields to null.
    return new Map();
  }
}
