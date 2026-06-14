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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_schema_1 = __importStar(require("../database/index.schema"));
const axios_1 = __importDefault(require("axios"));
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
const sharp_1 = __importDefault(require("sharp"));
const FORMAT_MIME = {
    jpeg: "image/jpeg",
    webp: "image/webp",
    png: "image/png",
};
class ToolsService {
    constructor() {
        this.GOOGLE_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
        this.TOOL_SELECT_FIELDS = [
            "id",
            "title as name",
            "slug",
            "short_description as description",
            "category_slug",
            "category_slug as category",
            "tool_type",
            "badge",
            "rating",
            "views",
            "users_count as usageCount",
            "tool_url",
        ];
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
    // ── Private helper: most-viewed tools excluding given ids ────────
    async getFallbackTools(excludeIds, limit) {
        const query = (0, index_schema_1.default)(index_schema_1.T.TOOLS)
            .select(...this.TOOL_SELECT_FIELDS)
            .where("status", "active")
            .orderBy("is_featured", "desc")
            .orderBy("views", "desc")
            .limit(limit);
        if (excludeIds && excludeIds.length > 0) {
            query.whereNotIn("id", excludeIds);
        }
        return query;
    }
    // ── Public: full tool page with recommendations ──────────────────
    async getToolPage(categorySlug, slug) {
        // 1. Fetch the tool row joined with its page content
        const tool = await (0, index_schema_1.default)(index_schema_1.T.TOOLS)
            .leftJoin(index_schema_1.T.TOOL_PAGES, `${index_schema_1.T.TOOLS}.slug`, `${index_schema_1.T.TOOL_PAGES}.tool_slug`)
            .select(`${index_schema_1.T.TOOLS}.id`, `${index_schema_1.T.TOOLS}.title`, `${index_schema_1.T.TOOLS}.slug`, `${index_schema_1.T.TOOLS}.category_slug`, `${index_schema_1.T.TOOLS}.tool_type`, `${index_schema_1.T.TOOLS}.tags`, `${index_schema_1.T.TOOLS}.short_description`, `${index_schema_1.T.TOOLS}.badge`, `${index_schema_1.T.TOOLS}.rating`, `${index_schema_1.T.TOOLS}.views`, `${index_schema_1.T.TOOLS}.users_count`, `${index_schema_1.T.TOOLS}.access_level`, `${index_schema_1.T.TOOLS}.daily_limit`, `${index_schema_1.T.TOOLS}.monthly_limit`, `${index_schema_1.T.TOOLS}.tool_url`, 
        // tool_pages columns
        `${index_schema_1.T.TOOL_PAGES}.page_title`, `${index_schema_1.T.TOOL_PAGES}.page_intro`, `${index_schema_1.T.TOOL_PAGES}.long_content`, `${index_schema_1.T.TOOL_PAGES}.features`, `${index_schema_1.T.TOOL_PAGES}.faqs`, `${index_schema_1.T.TOOL_PAGES}.meta_title`, `${index_schema_1.T.TOOL_PAGES}.meta_description`, `${index_schema_1.T.TOOL_PAGES}.meta_keywords`, `${index_schema_1.T.TOOL_PAGES}.canonical_url`, `${index_schema_1.T.TOOL_PAGES}.noindex`, `${index_schema_1.T.TOOL_PAGES}.schema_markup`)
            .where(`${index_schema_1.T.TOOLS}.slug`, slug)
            .where(`${index_schema_1.T.TOOLS}.category_slug`, categorySlug)
            .where(`${index_schema_1.T.TOOLS}.status`, "active")
            .first();
        if (!tool)
            return null;
        const toolId = Number(tool.id);
        const toolTags = tool.tags || [];
        // 2. Build all three recommendations in parallel
        const [related, popular, alsoUsed] = await Promise.all([
            this.getRelatedTools(categorySlug, toolId),
            this.getPopularTools(toolId),
            this.getAlsoUsedTools(toolId, toolTags),
        ]);
        return Object.assign(Object.assign({}, tool), { features: tool.features || [], faqs: tool.faqs || [], tags: toolTags, meta_keywords: tool.meta_keywords || [], recommendations: {
                related,
                popular,
                alsoUsed,
            } });
    }
    // ── Related: same category with daily rotation ───────────────────
    //
    // Uses a deterministic daily seed so the list rotates every day
    // without needing any views or session data. The seed is the
    // current day-of-year (1-365), so every tool page sees the same
    // rotation order on a given day (consistent UX) but it changes
    // daily to surface different tools over time.
    async getRelatedTools(categorySlug, excludeId) {
        // Day-of-year as a rotating seed (1–365)
        const dayOfYear = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
            86400000);
        return (0, index_schema_1.default)(index_schema_1.T.TOOLS)
            .select(...this.TOOL_SELECT_FIELDS)
            .where("category_slug", categorySlug)
            .where("status", "active")
            .whereNot("id", excludeId)
            // Rotate daily: ((id XOR seed) mod large_prime) gives a stable
            // daily shuffle that's different from the raw id ordering.
            .orderByRaw(`(id # ?) % 9973`, [dayOfYear])
            .limit(5);
    }
    // ── Popular: admin-curated via is_featured + sort_order ──────────
    //
    // Admin marks tools as is_featured=true in the admin panel.
    // sort_order controls the display sequence.
    // If fewer than 5 featured tools exist, the remaining slots are
    // filled by the next tools sorted by sort_order (ascending).
    async getPopularTools(excludeId) {
        return (0, index_schema_1.default)(index_schema_1.T.TOOLS)
            .select(...this.TOOL_SELECT_FIELDS)
            .where("status", "active")
            .whereNot("id", excludeId)
            // Featured tools first, then by admin-defined sort order
            .orderBy("is_featured", "desc")
            .orderBy("sort_order", "asc")
            .limit(5);
    }
    // ── Also-used: tag-similarity scoring ────────────────────────────
    //
    // Scores every other active tool by the number of tags it shares
    // with the current tool using Postgres array overlap (&&).
    // No session data or views needed — pure content-based similarity.
    //
    // Falls back to getPopularTools() if the current tool has no tags
    // or no other tools share any tags.
    async getAlsoUsedTools(excludeId, currentTags) {
        if (currentTags.length > 0) {
            try {
                // Count shared tags using Postgres array functions.
                // array_length(ARRAY(SELECT unnest(a) INTERSECT SELECT unnest(b)), 1)
                // returns the number of common elements between two text arrays.
                const similar = await (0, index_schema_1.default)(index_schema_1.T.TOOLS)
                    .select(...this.TOOL_SELECT_FIELDS, 
                // Compute tag overlap count as a virtual column
                index_schema_1.default.raw(`array_length(
                ARRAY(
                  SELECT unnest(tags::text[])
                  INTERSECT
                  SELECT unnest(?::text[])
                ), 1
              ) AS tag_overlap`, [currentTags]))
                    .where("status", "active")
                    .whereNot("id", excludeId)
                    // Must share at least one tag
                    .whereRaw(`tags && ?::text[]`, [currentTags])
                    // Highest overlap first; break ties by sort_order then id
                    .orderBy("tag_overlap", "desc")
                    .orderBy("sort_order", "asc")
                    .limit(5);
                if (similar.length > 0) {
                    // Strip the virtual column before returning to keep the
                    // ToolItem shape clean on the frontend
                    return similar.map((_a) => {
                        var { tag_overlap } = _a, rest = __rest(_a, ["tag_overlap"]);
                        return rest;
                    });
                }
            }
            catch (_a) {
                // Array functions unavailable or query failed — fall through
            }
        }
        // Fallback: admin-curated popular tools
        return this.getPopularTools(excludeId);
    }
    resolveCompressionStrategy(mimeType, sizeBytes) {
        const sizeKB = sizeBytes / 1024;
        const sizeMB = sizeKB / 1024;
        // Very large images — aggressive treatment regardless of format
        if (sizeMB > 2) {
            return {
                outputFormat: "webp",
                quality: 70,
                maxDimension: 2400,
                aiMessage: "Large image: converted to WebP and resized for web",
            };
        }
        switch (mimeType) {
            case "image/png": {
                const quality = sizeKB < 500 ? 85 : 80;
                return {
                    outputFormat: "webp",
                    quality,
                    maxDimension: null,
                    aiMessage: "PNG converted to WebP for maximum compression with quality",
                };
            }
            case "image/jpeg":
            case "image/jpg": {
                if (sizeKB < 500) {
                    return {
                        outputFormat: "jpeg",
                        quality: 82,
                        maxDimension: null,
                        aiMessage: "Small JPEG: light compression to preserve quality",
                    };
                }
                return {
                    outputFormat: "jpeg",
                    quality: 75,
                    maxDimension: null,
                    aiMessage: "JPEG optimized with balanced quality",
                };
            }
            case "image/webp": {
                return {
                    outputFormat: "webp",
                    quality: 80,
                    maxDimension: null,
                    aiMessage: "WebP re-encoded at optimal quality",
                };
            }
            case "image/gif":
            case "image/bmp":
            default: {
                return {
                    outputFormat: "webp",
                    quality: 75,
                    maxDimension: null,
                    aiMessage: "Converted to WebP for better compression",
                };
            }
        }
    }
    async aiCompressImage(input) {
        var _a;
        try {
            // 1. Resolve strategy (swap this function for real AI in Phase 2)
            const strategy = this.resolveCompressionStrategy(input.mimeType, input.size);
            // 2. Build Sharp pipeline
            let pipeline = (0, sharp_1.default)(input.buffer, { failOn: "none" });
            // 3. Optional resize — preserves aspect ratio, never upscales
            if (strategy.maxDimension) {
                pipeline = pipeline.resize({
                    width: strategy.maxDimension,
                    height: strategy.maxDimension,
                    fit: "inside",
                    withoutEnlargement: true,
                });
            }
            // 4. Apply output format + quality
            switch (strategy.outputFormat) {
                case "jpeg":
                    // mozjpeg encoder: better compression than libjpeg at same quality
                    pipeline = pipeline.jpeg({
                        quality: strategy.quality,
                        mozjpeg: true,
                    });
                    break;
                case "webp":
                    // effort 4 = good compression speed trade-off (0 = fastest, 6 = best)
                    pipeline = pipeline.webp({ quality: strategy.quality, effort: 4 });
                    break;
                case "png":
                    pipeline = pipeline.png({ compressionLevel: 9, effort: 10 });
                    break;
            }
            // 5. Execute
            const outputBuffer = await pipeline.toBuffer();
            return {
                imageBase64: outputBuffer.toString("base64"),
                mimeType: FORMAT_MIME[strategy.outputFormat],
                outputFormat: strategy.outputFormat,
                aiMessage: strategy.aiMessage,
                originalSize: input.size,
                compressedSize: outputBuffer.length,
            };
        }
        catch (err) {
            // Surface a clean HTTP error so the controller's next(error) renders it
            throw new HttpException_1.default(500, `Image optimization failed: ${(_a = err === null || err === void 0 ? void 0 : err.message) !== null && _a !== void 0 ? _a : "unknown error"}`);
        }
    }
}
exports.default = ToolsService;
//# sourceMappingURL=tools.services.js.map