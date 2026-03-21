"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("../database/index.schema"));
const axios_1 = __importDefault(require("axios"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class ToolsService {
    constructor() {
        this.GOOGLE_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
    }
    /**
     * ALL tools across every category
     * Used by GET /tools/all
     */
    async getAllTools() {
        const [tools, categories] = await Promise.all([
            (0, index_schema_1.default)(index_schema_1.T.TOOLS)
                .select("id", "title", "slug", "short_description", "category_slug", "tool_type", "tags", "badge", "rating", "views", "users_count", "tool_url")
                .where({ status: "active" })
                .orderBy([
                { column: "is_featured", order: "desc" },
                { column: "sort_order", order: "asc" },
                { column: "created_at", order: "desc" },
            ]),
            (0, index_schema_1.default)("tools_category_pages")
                .select("category_slug as slug", "page_title", "page_description")
                .where({ status: "active" }),
        ]);
        return { categories, tools };
    }
    /**
     * Tools listing (cards)
     * Reads ONLY `tools`
     */
    async getToolsByCategory(categorySlug) {
        return (0, index_schema_1.default)(index_schema_1.T.TOOLS)
            .select("id", "title", "slug", "short_description", "category_slug", "tool_type", "tags", "badge", "rating", "views", "users_count", "tool_url")
            .where({
            category_slug: categorySlug,
            status: "active",
        })
            .orderBy([
            { column: "is_featured", order: "desc" },
            { column: "sort_order", order: "asc" },
            { column: "created_at", order: "desc" },
        ]);
    }
    /**
     * Tool detail page
     * JOIN tools + tool_pages
     */
    async getToolPage(categorySlug, toolSlug, sessionId) {
        const tool = await (0, index_schema_1.default)("tools")
            .leftJoin("tool_pages", "tools.slug", "tool_pages.tool_slug")
            .select("tools.id", "tools.title", "tools.slug", "tools.category_slug", "tools.tool_type", "tools.tags", "tools.short_description", "tools.badge", "tools.rating", "tools.views", "tools.users_count", "tools.last_used_at", "tools.access_level", "tools.daily_limit", "tools.monthly_limit", "tools.tool_url", "tool_pages.page_title", "tool_pages.page_intro", "tool_pages.long_content", "tool_pages.features", "tool_pages.faqs", "tool_pages.meta_title", "tool_pages.meta_description", "tool_pages.meta_keywords", "tool_pages.canonical_url", "tool_pages.schema_markup", "tool_pages.noindex")
            .where({
            "tools.slug": toolSlug,
            "tools.category_slug": categorySlug,
            "tools.status": "active",
        })
            .andWhere("tool_pages.status", "active")
            .first();
        if (!tool)
            return null;
        /*
            AUTO TRACK PAGE VIEW
            */
        if (sessionId) {
            await Promise.all([
                (0, index_schema_1.default)("tools")
                    .where({ id: tool.id })
                    .update({
                    views: index_schema_1.default.raw("views + 1"),
                }),
                this.trackToolEvent({
                    tool_id: tool.id,
                    event_type: "PAGE_VIEW",
                    session_id: sessionId,
                    meta: { page: "tool_detail" },
                }),
            ]);
        }
        /*
            GET RECOMMENDATIONS
            */
        const recommendations = await this.getRecommendations(tool.id);
        return Object.assign(Object.assign({}, tool), { recommendations });
    }
    async getCategoryPage(categorySlug) {
        const categoryPage = await (0, index_schema_1.default)("tools_category_pages")
            .select("page_title", "page_description", "page_intro", "meta_title", "meta_description", "meta_keywords", "canonical_url", "noindex")
            .where({
            category_slug: categorySlug,
            status: "active",
        })
            .first();
        return categoryPage || null;
    }
    // DROP-IN REPLACEMENT for the testWebsiteSpeed method
    async testWebsiteSpeed(url) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26;
        try {
            const response = await axios_1.default.get(this.GOOGLE_API, {
                params: {
                    url,
                    key: process.env.GOOGLE_PAGESPEED_API_KEY,
                    category: ["performance"],
                    strategy: "mobile",
                },
            });
            const lighthouse = response.data.lighthouseResult;
            const audits = lighthouse.audits;
            const categories = lighthouse.categories;
            /* ── Overall score & grade ─────────────────────────── */
            const score = Math.round(categories.performance.score * 100);
            const grade = score >= 90
                ? "A"
                : score >= 80
                    ? "B"
                    : score >= 70
                        ? "C"
                        : score >= 60
                            ? "D"
                            : "F";
            /* ── Resource sizes ────────────────────────────────── */
            const totalBytes = ((_a = audits["total-byte-weight"]) === null || _a === void 0 ? void 0 : _a.numericValue) || 0;
            const requests = ((_d = (_c = (_b = audits["network-requests"]) === null || _b === void 0 ? void 0 : _b.details) === null || _c === void 0 ? void 0 : _c.items) === null || _d === void 0 ? void 0 : _d.length) || 0;
            /* ── Core timing metrics ───────────────────────────── */
            const metrics = {
                loadTime: ((_e = audits["interactive"]) === null || _e === void 0 ? void 0 : _e.numericValue) || 0,
                domContentLoaded: ((_f = audits["dom-content-loaded"]) === null || _f === void 0 ? void 0 : _f.numericValue) || 0,
                firstContentfulPaint: ((_g = audits["first-contentful-paint"]) === null || _g === void 0 ? void 0 : _g.numericValue) || 0,
                timeToInteractive: ((_h = audits["interactive"]) === null || _h === void 0 ? void 0 : _h.numericValue) || 0,
                totalSize: totalBytes / 1024,
                requests,
                imageSize: this.getResourceSize(audits, "image"),
                scriptSize: this.getResourceSize(audits, "script"),
                styleSize: this.getResourceSize(audits, "stylesheet"),
                score,
                grade,
                /* ── Core Web Vitals ─────────────────────────────── */
                coreWebVitals: {
                    lcp: {
                        value: ((_j = audits["largest-contentful-paint"]) === null || _j === void 0 ? void 0 : _j.numericValue) || 0,
                        display: ((_k = audits["largest-contentful-paint"]) === null || _k === void 0 ? void 0 : _k.displayValue) || "N/A",
                        score: (_m = (_l = audits["largest-contentful-paint"]) === null || _l === void 0 ? void 0 : _l.score) !== null && _m !== void 0 ? _m : null,
                    },
                    cls: {
                        value: ((_o = audits["cumulative-layout-shift"]) === null || _o === void 0 ? void 0 : _o.numericValue) || 0,
                        display: ((_p = audits["cumulative-layout-shift"]) === null || _p === void 0 ? void 0 : _p.displayValue) || "N/A",
                        score: (_r = (_q = audits["cumulative-layout-shift"]) === null || _q === void 0 ? void 0 : _q.score) !== null && _r !== void 0 ? _r : null,
                    },
                    tbt: {
                        value: ((_s = audits["total-blocking-time"]) === null || _s === void 0 ? void 0 : _s.numericValue) || 0,
                        display: ((_t = audits["total-blocking-time"]) === null || _t === void 0 ? void 0 : _t.displayValue) || "N/A",
                        score: (_v = (_u = audits["total-blocking-time"]) === null || _u === void 0 ? void 0 : _u.score) !== null && _v !== void 0 ? _v : null,
                    },
                    fcp: {
                        value: ((_w = audits["first-contentful-paint"]) === null || _w === void 0 ? void 0 : _w.numericValue) || 0,
                        display: ((_x = audits["first-contentful-paint"]) === null || _x === void 0 ? void 0 : _x.displayValue) || "N/A",
                        score: (_z = (_y = audits["first-contentful-paint"]) === null || _y === void 0 ? void 0 : _y.score) !== null && _z !== void 0 ? _z : null,
                    },
                    speedIndex: {
                        value: ((_0 = audits["speed-index"]) === null || _0 === void 0 ? void 0 : _0.numericValue) || 0,
                        display: ((_1 = audits["speed-index"]) === null || _1 === void 0 ? void 0 : _1.displayValue) || "N/A",
                        score: (_3 = (_2 = audits["speed-index"]) === null || _2 === void 0 ? void 0 : _2.score) !== null && _3 !== void 0 ? _3 : null,
                    },
                },
                /* ── Diagnostics ─────────────────────────────────── */
                diagnostics: {
                    ttfb: {
                        value: ((_4 = audits["server-response-time"]) === null || _4 === void 0 ? void 0 : _4.numericValue) || 0,
                        display: ((_5 = audits["server-response-time"]) === null || _5 === void 0 ? void 0 : _5.displayValue) || "N/A",
                        score: (_7 = (_6 = audits["server-response-time"]) === null || _6 === void 0 ? void 0 : _6.score) !== null && _7 !== void 0 ? _7 : null,
                    },
                    domSize: {
                        value: ((_8 = audits["dom-size"]) === null || _8 === void 0 ? void 0 : _8.numericValue) || 0,
                        display: ((_9 = audits["dom-size"]) === null || _9 === void 0 ? void 0 : _9.displayValue) || "N/A",
                        score: (_11 = (_10 = audits["dom-size"]) === null || _10 === void 0 ? void 0 : _10.score) !== null && _11 !== void 0 ? _11 : null,
                    },
                    bootupTime: {
                        value: ((_12 = audits["bootup-time"]) === null || _12 === void 0 ? void 0 : _12.numericValue) || 0,
                        display: ((_13 = audits["bootup-time"]) === null || _13 === void 0 ? void 0 : _13.displayValue) || "N/A",
                        score: (_15 = (_14 = audits["bootup-time"]) === null || _14 === void 0 ? void 0 : _14.score) !== null && _15 !== void 0 ? _15 : null,
                    },
                    mainThreadWork: {
                        value: ((_16 = audits["mainthread-work-breakdown"]) === null || _16 === void 0 ? void 0 : _16.numericValue) || 0,
                        display: ((_17 = audits["mainthread-work-breakdown"]) === null || _17 === void 0 ? void 0 : _17.displayValue) || "N/A",
                        score: (_19 = (_18 = audits["mainthread-work-breakdown"]) === null || _18 === void 0 ? void 0 : _18.score) !== null && _19 !== void 0 ? _19 : null,
                    },
                    thirdPartyBytes: {
                        value: ((_20 = audits["third-party-summary"]) === null || _20 === void 0 ? void 0 : _20.numericValue) || 0,
                        display: ((_21 = audits["third-party-summary"]) === null || _21 === void 0 ? void 0 : _21.displayValue) || "N/A",
                        score: (_23 = (_22 = audits["third-party-summary"]) === null || _22 === void 0 ? void 0 : _22.score) !== null && _23 !== void 0 ? _23 : null,
                    },
                },
                /* ── Recommendations & passed audits ─────────────── */
                recommendations: this.extractRecommendations(audits),
                passedAuditsCount: this.countPassedAudits(audits),
            };
            return metrics;
        }
        catch (error) {
            if ((_26 = (_25 = (_24 = error.response) === null || _24 === void 0 ? void 0 : _24.data) === null || _25 === void 0 ? void 0 : _25.error) === null || _26 === void 0 ? void 0 : _26.message) {
                throw new HttpException_1.default(400, error.response.data.error.message);
            }
            throw new HttpException_1.default(500, "Failed to analyze website speed");
        }
    }
    // PRIVATE HELPERS — replace existing versions
    getResourceSize(audits, type) {
        var _a, _b;
        const items = ((_b = (_a = audits["network-requests"]) === null || _a === void 0 ? void 0 : _a.details) === null || _b === void 0 ? void 0 : _b.items) || [];
        return (items
            .filter((item) => item.resourceType === type)
            .reduce((sum, item) => sum + (item.transferSize || 0), 0) /
            1024);
    }
    extractRecommendations(audits) {
        var _a, _b;
        const recommendations = [];
        // Audit key → minimum score to include, category tag
        const targets = [
            // Critical — direct timing impact
            { key: "render-blocking-resources", threshold: 0.9 },
            { key: "server-response-time", threshold: 0.9 },
            { key: "bootup-time", threshold: 0.9 },
            { key: "mainthread-work-breakdown", threshold: 0.9 },
            // Warnings — size / transfer impact
            { key: "unused-javascript", threshold: 1.0 },
            { key: "unused-css-rules", threshold: 1.0 },
            { key: "uses-optimized-images", threshold: 1.0 },
            { key: "modern-image-formats", threshold: 1.0 },
            { key: "efficiently-encode-images", threshold: 1.0 },
            { key: "uses-text-compression", threshold: 1.0 },
            { key: "uses-long-cache-ttl", threshold: 0.9 },
            { key: "uses-responsive-images", threshold: 1.0 },
            // Info — best practice hints
            { key: "dom-size", threshold: 0.9 },
            { key: "third-party-summary", threshold: 0.9 },
            { key: "font-display", threshold: 1.0 },
            { key: "uses-passive-event-listeners", threshold: 1.0 },
            { key: "no-document-write", threshold: 1.0 },
            { key: "uses-http2", threshold: 0.9 },
        ];
        for (const { key, threshold } of targets) {
            const audit = audits[key];
            if (!audit || audit.score === null || audit.score >= threshold)
                continue;
            // Severity bucket
            let severity;
            if (audit.score < 0.5)
                severity = "critical";
            else if (audit.score < 0.9)
                severity = "warning";
            else
                severity = "info";
            // Pull savings if available
            const savingsMs = ((_a = audit.details) === null || _a === void 0 ? void 0 : _a.overallSavingsMs) ||
                (audit.numericValue && key === "server-response-time")
                ? audit.numericValue
                : undefined;
            const savingsBytes = ((_b = audit.details) === null || _b === void 0 ? void 0 : _b.overallSavingsBytes) || undefined;
            let savingsDisplay;
            if (savingsMs && savingsMs > 0) {
                savingsDisplay = `~${(savingsMs / 1000).toFixed(1)}s`;
            }
            else if (savingsBytes && savingsBytes > 0) {
                savingsDisplay =
                    savingsBytes < 1024 * 1024
                        ? `~${(savingsBytes / 1024).toFixed(0)} KB`
                        : `~${(savingsBytes / (1024 * 1024)).toFixed(1)} MB`;
            }
            recommendations.push(Object.assign(Object.assign(Object.assign({ severity, title: audit.title || key, description: audit.description || "" }, (savingsMs ? { savingsMs } : {})), (savingsBytes ? { savingsBytes } : {})), (savingsDisplay ? { savingsDisplay } : {})));
        }
        // Sort: critical first, then warning, then info
        const order = { critical: 0, warning: 1, info: 2 };
        recommendations.sort((a, b) => order[a.severity] - order[b.severity]);
        return recommendations;
    }
    countPassedAudits(audits) {
        return Object.values(audits).filter((a) => (a === null || a === void 0 ? void 0 : a.score) !== null && (a === null || a === void 0 ? void 0 : a.score) === 1).length;
    }
    /*
    ========================================
    TRACK EVENT
    ========================================
    */
    async trackToolEvent(payload) {
        await (0, index_schema_1.default)("tool_events").insert({
            tool_id: payload.tool_id,
            event_type: payload.event_type,
            session_id: payload.session_id,
            ref_tool_id: payload.ref_tool_id || null,
            user_id: payload.user_id || null,
            meta: index_schema_1.default.raw("?::jsonb", [JSON.stringify(payload.meta || {})]),
        });
        /*
            TOOL RUN UPDATE
            */
        if (payload.event_type === "TOOL_RUN") {
            await (0, index_schema_1.default)("tools")
                .where({
                id: payload.tool_id,
            })
                .update({
                users_count: index_schema_1.default.raw("users_count + 1"),
                last_used_at: index_schema_1.default.fn.now(),
            });
        }
    }
    /*
      ========================================
      RECOMMENDATIONS MASTER
      ========================================
      */
    async getRecommendations(toolId) {
        const [related, popular, alsoUsed] = await Promise.all([
            this.getRelatedTools(toolId),
            this.getPopularTools(toolId),
            this.getAlsoUsedTools(toolId),
        ]);
        return {
            related,
            popular,
            alsoUsed,
        };
    }
    /*
      ========================================
      RELATED TOOLS
      ========================================
      */
    async getRelatedTools(toolId, limit = 6) {
        const base = await (0, index_schema_1.default)("tools")
            .select("category_slug", "tool_type", "tags")
            .where({ id: toolId })
            .first();
        if (!base)
            return [];
        return (0, index_schema_1.default)("tools")
            .select("id", "title", "slug", "short_description", "category_slug", "tool_type", "badge", "rating", "views", "users_count", "tool_url")
            .where("status", "active")
            .whereNot("id", toolId)
            .andWhere((qb) => {
            qb.where("category_slug", base.category_slug)
                .orWhere("tool_type", base.tool_type)
                .orWhereRaw("tags && ?::text[]", [base.tags || []]);
        })
            .orderBy("is_featured", "desc")
            .orderBy("views", "desc")
            .limit(limit);
    }
    /*
      ========================================
      POPULAR TOOLS
      ========================================
      */
    async getPopularTools(toolId, limit = 8) {
        const popular = await (0, index_schema_1.default)("tool_events as e")
            .join("tools as t", "t.id", "e.tool_id")
            .select("t.id", "t.title", "t.slug", "t.short_description", "t.category_slug", "t.tool_type", "t.badge", "t.rating", "t.views", "t.users_count", "t.tool_url", index_schema_1.default.raw("COUNT(*)::int as runs"))
            .where("e.event_type", "TOOL_RUN")
            .where("e.created_at", ">=", index_schema_1.default.raw("now() - interval '7 days'"))
            .whereNot("t.id", toolId)
            .groupBy("t.id")
            .orderBy("runs", "desc")
            .limit(limit);
        if (popular.length)
            return popular;
        /*
            FALLBACK
            */
        return (0, index_schema_1.default)("tools")
            .select("id", "title", "slug", "short_description", "category_slug", "tool_type", "badge", "rating", "views", "users_count", "tool_url")
            .where("status", "active")
            .whereNot("id", toolId)
            .orderBy("views", "desc")
            .limit(limit);
    }
    /*
      ========================================
      ALSO USED
      ========================================
      */
    async getAlsoUsedTools(toolId, limit = 6) {
        const sessions = await (0, index_schema_1.default)("tool_events")
            .distinct("session_id")
            .where({
            tool_id: toolId,
            event_type: "TOOL_RUN",
        })
            .limit(500);
        const ids = sessions.map((s) => s.session_id);
        if (!ids.length)
            return [];
        return (0, index_schema_1.default)("tool_events as e")
            .join("tools as t", "t.id", "e.tool_id")
            .select("t.id", "t.title", "t.slug", "t.short_description", "t.category_slug", "t.tool_type", "t.badge", "t.rating", "t.views", "t.users_count", "t.tool_url", index_schema_1.default.raw("COUNT(*)::int as hits"))
            .whereIn("e.session_id", ids)
            .whereNot("t.id", toolId)
            .groupBy("t.id")
            .orderBy("hits", "desc")
            .limit(limit);
    }
    async checkOpenGraph(url) {
        var _a, _b;
        try {
            const response = await axios_1.default.get(url, {
                timeout: 10000,
                headers: {
                    "User-Agent": "Mozilla/5.0 (compatible; OGChecker/1.0)",
                    Accept: "text/html",
                },
                maxRedirects: 5,
            });
            const html = response.data;
            const getMeta = (property) => {
                const match = html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ||
                    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"));
                return match ? match[1] : null;
            };
            const getMetaName = (name) => {
                const match = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i")) ||
                    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"));
                return match ? match[1] : null;
            };
            const getTitleTag = () => {
                const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                return match ? match[1].trim() : "";
            };
            const getFavicon = () => {
                const match = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ||
                    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
                if (!match)
                    return `${new URL(url).origin}/favicon.ico`;
                const href = match[1];
                return href.startsWith("http") ? href : `${new URL(url).origin}${href}`;
            };
            // Extract all tags
            const ogTitle = getMeta("og:title");
            const ogDescription = getMeta("og:description");
            const ogImage = getMeta("og:image");
            const ogUrl = getMeta("og:url");
            const ogType = getMeta("og:type");
            const ogSiteName = getMeta("og:site_name");
            const ogLocale = getMeta("og:locale");
            const twCard = getMetaName("twitter:card");
            const twTitle = getMetaName("twitter:title");
            const twDescription = getMetaName("twitter:description");
            const twImage = getMetaName("twitter:image");
            const twSite = getMetaName("twitter:site");
            const metaDesc = getMetaName("description");
            const titleTag = getTitleTag();
            const tag = (property, content, required = false) => {
                if (!content)
                    return {
                        property,
                        content: "",
                        status: required ? "missing" : "missing",
                    };
                return { property, content, status: "found" };
            };
            // Score calculation
            const requiredTags = [ogTitle, ogDescription, ogImage, ogUrl];
            const recommendedTags = [
                ogType,
                ogSiteName,
                twCard,
                twTitle,
                twDescription,
            ];
            const foundRequired = requiredTags.filter(Boolean).length;
            const foundRecommended = recommendedTags.filter(Boolean).length;
            const score = Math.round((foundRequired / 4) * 60 + (foundRecommended / 5) * 40);
            // Issues, warnings, suggestions
            const issues = [];
            const warnings = [];
            const suggestions = [];
            if (!ogTitle)
                issues.push("og:title is missing — required for all social shares");
            if (!ogDescription)
                issues.push("og:description is missing — required for rich previews");
            if (!ogImage)
                issues.push("og:image is missing — your link will show no image when shared");
            if (!ogUrl)
                issues.push("og:url is missing — canonical URL for the shared page");
            if (!ogType)
                warnings.push("og:type not set — defaults to 'website' but should be explicit");
            if (!ogSiteName)
                warnings.push("og:site_name not set — recommended for brand recognition");
            if (!ogLocale)
                warnings.push("og:locale not set — recommended (e.g. en_US)");
            if (ogImage && !getMeta("og:image:width"))
                warnings.push("og:image dimensions not specified — add og:image:width and og:image:height for faster rendering");
            if (ogImage && !getMeta("og:image:alt"))
                warnings.push("og:image:alt missing — important for accessibility");
            if (!twCard)
                suggestions.push("Add twitter:card for better Twitter/X share appearance");
            if (!twTitle)
                suggestions.push("Add twitter:title — fallback to og:title otherwise");
            if (!twDescription)
                suggestions.push("Add twitter:description for Twitter/X previews");
            if (!twImage)
                suggestions.push("Add twitter:image for a dedicated Twitter/X card image");
            if (!twSite)
                suggestions.push("Add twitter:site with your @handle to credit your brand");
            return {
                url,
                metaTitle: titleTag,
                metaDescription: metaDesc || "",
                faviconUrl: getFavicon(),
                score,
                issues,
                warnings,
                suggestions,
                validationResult: {
                    title: tag("og:title", ogTitle),
                    description: tag("og:description", ogDescription),
                    image: tag("og:image", ogImage),
                    url: tag("og:url", ogUrl),
                    type: tag("og:type", ogType),
                    siteName: tag("og:site_name", ogSiteName),
                    locale: tag("og:locale", ogLocale),
                    twitterCard: tag("twitter:card", twCard),
                    twitterTitle: tag("twitter:title", twTitle),
                    twitterDescription: tag("twitter:description", twDescription),
                    twitterImage: tag("twitter:image", twImage),
                    twitterSite: tag("twitter:site", twSite),
                },
            };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                if (error.code === "ECONNREFUSED")
                    throw new HttpException_1.default(400, "Could not connect to the URL");
                if (error.code === "ETIMEDOUT")
                    throw new HttpException_1.default(400, "Request timed out — site took too long to respond");
                if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 403)
                    throw new HttpException_1.default(400, "Site blocked the request (403 Forbidden)");
                if (((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 404)
                    throw new HttpException_1.default(400, "Page not found (404)");
            }
            throw new HttpException_1.default(500, "Failed to fetch OG tags from the URL");
        }
    }
    async protectPdf(opts) {
        const fs = await Promise.resolve().then(() => __importStar(require("fs")));
        const path = await Promise.resolve().then(() => __importStar(require("path")));
        const os = await Promise.resolve().then(() => __importStar(require("os")));
        const { execFile } = await Promise.resolve().then(() => __importStar(require("child_process")));
        const { promisify } = await Promise.resolve().then(() => __importStar(require("util")));
        const execFileAsync = promisify(execFile);
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `pdfprotect-in-${Date.now()}.pdf`);
        const outputPath = path.join(tmpDir, `pdfprotect-out-${Date.now()}.pdf`);
        fs.writeFileSync(inputPath, opts.buffer);
        try {
            const args = [
                "--encrypt",
                opts.password, // user password
                opts.ownerPassword, // owner password
                "256", // AES-256
                "--", // end of encrypt options
                ...(opts.allowPrint ? [] : ["--print=none"]),
                ...(opts.allowCopy ? [] : ["--extract=n"]),
                ...(opts.allowModify ? [] : ["--modify=none"]),
                inputPath,
                outputPath,
            ];
            await execFileAsync("qpdf", args);
            const encryptedBuffer = fs.readFileSync(outputPath);
            const fileName = opts.originalName.replace(/\.pdf$/i, "_protected.pdf");
            return { buffer: encryptedBuffer, fileName };
        }
        catch (err) {
            if (err instanceof HttpException_1.default)
                throw err;
            throw new HttpException_1.default(500, "Failed to encrypt PDF: " + (err.stderr || err.message));
        }
        finally {
            try {
                if (fs.existsSync(inputPath))
                    fs.unlinkSync(inputPath);
            }
            catch (_a) { }
            try {
                if (fs.existsSync(outputPath))
                    fs.unlinkSync(outputPath);
            }
            catch (_b) { }
        }
    }
    async unlockPdf(opts) {
        const fs = await Promise.resolve().then(() => __importStar(require("fs")));
        const path = await Promise.resolve().then(() => __importStar(require("path")));
        const os = await Promise.resolve().then(() => __importStar(require("os")));
        const { execFile } = await Promise.resolve().then(() => __importStar(require("child_process")));
        const { promisify } = await Promise.resolve().then(() => __importStar(require("util")));
        const execFileAsync = promisify(execFile);
        const tmpDir = os.tmpdir();
        const inputPath = path.join(tmpDir, `pdfunlock-in-${Date.now()}.pdf`);
        const outputPath = path.join(tmpDir, `pdfunlock-out-${Date.now()}.pdf`);
        fs.writeFileSync(inputPath, opts.buffer);
        try {
            // Call qpdf binary directly — full control over args and exit codes
            await execFileAsync("qpdf", [
                `--password=${opts.password}`,
                "--decrypt",
                inputPath,
                outputPath,
            ]);
            if (!fs.existsSync(outputPath)) {
                throw new HttpException_1.default(400, "Decryption failed — output file not created");
            }
            const decryptedBuffer = fs.readFileSync(outputPath);
            const fileName = opts.originalName.replace(/\.pdf$/i, "_unlocked.pdf");
            return { buffer: decryptedBuffer, fileName };
        }
        catch (err) {
            // Re-throw HttpException cleanly
            if (err instanceof HttpException_1.default)
                throw err;
            const msg = (err.message || "").toLowerCase();
            const stderr = (err.stderr || "").toLowerCase();
            const combined = msg + " " + stderr;
            if (combined.includes("invalid password") ||
                combined.includes("password incorrect") ||
                combined.includes("exit code 2") ||
                err.code === 2) {
                throw new HttpException_1.default(400, "Incorrect password — please check and try again");
            }
            if (combined.includes("not encrypted")) {
                throw new HttpException_1.default(400, "This PDF is not password protected");
            }
            throw new HttpException_1.default(500, "Failed to unlock PDF: " + (err.stderr || err.message));
        }
        finally {
            try {
                if (fs.existsSync(inputPath))
                    fs.unlinkSync(inputPath);
            }
            catch (_a) { }
            try {
                if (fs.existsSync(outputPath))
                    fs.unlinkSync(outputPath);
            }
            catch (_b) { }
        }
    }
}
exports.default = ToolsService;
//# sourceMappingURL=tools.services.js.map