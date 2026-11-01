"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandbySeoMetricsProvider = void 0;
/**
 * Standby Provider (Approach B - Idle)
 *
 * Used when no paid SEO API (like DataForSEO or Keywords Everywhere) is configured.
 * Does not make external network requests and incurs 0 cost.
 */
class StandbySeoMetricsProvider {
    constructor() {
        this.name = "none";
    }
    isEnabled() {
        return false;
    }
    async fetchMetrics(_keywords, _country, _language) {
        // Returns an empty map; consumer will default metrics fields to null.
        return new Map();
    }
}
exports.StandbySeoMetricsProvider = StandbySeoMetricsProvider;
//# sourceMappingURL=standby.provider.js.map