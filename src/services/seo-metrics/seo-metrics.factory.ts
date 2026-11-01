// src/services/seo-metrics/seo-metrics.factory.ts
import { SeoMetricsProvider } from "./seo-metrics.interface";
import { StandbySeoMetricsProvider } from "./standby.provider";
import { DataForSeoProvider } from "./dataforseo.provider";
import { KeywordsEverywhereProvider } from "./keywordseverywhere.provider";
import { SerpApiProvider } from "./serpapi.provider";

/**
 * Returns the configured SEO metrics provider.
 *
 * Controlled via environment variable:
 *   SEO_METRICS_PROVIDER = "none" | "dataforseo" | "keywordseverywhere" | "serpapi"
 *
 * If no provider is configured, or if the chosen provider has no valid API credentials,
 * it safely falls back to the StandbySeoMetricsProvider (0 cost, 0 network requests).
 */
export function getSeoMetricsProvider(): SeoMetricsProvider {
  const providerName = (process.env.SEO_METRICS_PROVIDER || "none").toLowerCase().trim();

  if (providerName === "dataforseo") {
    const dataForSeo = new DataForSeoProvider();
    if (dataForSeo.isEnabled()) {
      return dataForSeo;
    }
  }

  if (providerName === "keywordseverywhere") {
    const kwEverywhere = new KeywordsEverywhereProvider();
    if (kwEverywhere.isEnabled()) {
      return kwEverywhere;
    }
  }

  if (providerName === "serpapi") {
    const serpApi = new SerpApiProvider();
    if (serpApi.isEnabled()) {
      return serpApi;
    }
  }

  return new StandbySeoMetricsProvider();
}
