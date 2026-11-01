"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSeoMetricsProvider = getSeoMetricsProvider;
const standby_provider_1 = require("./standby.provider");
const dataforseo_provider_1 = require("./dataforseo.provider");
const keywordseverywhere_provider_1 = require("./keywordseverywhere.provider");
const serpapi_provider_1 = require("./serpapi.provider");
/**
 * Returns the configured SEO metrics provider.
 *
 * Controlled via environment variable:
 *   SEO_METRICS_PROVIDER = "none" | "dataforseo" | "keywordseverywhere" | "serpapi"
 *
 * If no provider is configured, or if the chosen provider has no valid API credentials,
 * it safely falls back to the StandbySeoMetricsProvider (0 cost, 0 network requests).
 */
function getSeoMetricsProvider() {
    const providerName = (process.env.SEO_METRICS_PROVIDER || "none").toLowerCase().trim();
    if (providerName === "dataforseo") {
        const dataForSeo = new dataforseo_provider_1.DataForSeoProvider();
        if (dataForSeo.isEnabled()) {
            return dataForSeo;
        }
    }
    if (providerName === "keywordseverywhere") {
        const kwEverywhere = new keywordseverywhere_provider_1.KeywordsEverywhereProvider();
        if (kwEverywhere.isEnabled()) {
            return kwEverywhere;
        }
    }
    if (providerName === "serpapi") {
        const serpApi = new serpapi_provider_1.SerpApiProvider();
        if (serpApi.isEnabled()) {
            return serpApi;
        }
    }
    return new standby_provider_1.StandbySeoMetricsProvider();
}
//# sourceMappingURL=seo-metrics.factory.js.map