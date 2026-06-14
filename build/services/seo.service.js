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
const HttpException_1 = __importDefault(require("../exceptions/HttpException"));
class SeoService {
    /* =====================================================
       PUBLIC METHODS
    ===================================================== */
    /**
     * Get static page SEO by page_key (Frontend use)
     */
    async getStaticPageSEO(page_key) {
        const page = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .select("id", "page_key", "meta_title", "meta_description", "meta_keywords", "canonical_url", "og_image", "noindex", "nofollow", "priority", "changefreq", "status", "updated_at")
            .where("page_key", page_key)
            .where("status", "active")
            .first();
        return page || null;
    }
    /**
     * Get static pages for sitemap.xml
     */
    async getStaticPagesForSitemap() {
        const pages = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .select("page_key", "canonical_url", "priority", "changefreq", "updated_at")
            .where("status", "active")
            .where("noindex", false)
            .orderBy("updated_at", "desc");
        return pages;
    }
    /* =====================================================
       ADMIN METHODS
    ===================================================== */
    /**
     * Get all static SEO records with pagination
     */
    async getAllStaticPageSEO(filters) {
        if (!filters) {
            return (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES).orderBy("created_at", "desc");
        }
        const { page, limit, search, status, sort_by, sort_order } = filters;
        const offset = (page - 1) * limit;
        const allowedSortColumns = [
            "created_at",
            "updated_at",
            "page_key",
        ];
        const safeSortBy = allowedSortColumns.includes(sort_by)
            ? sort_by
            : "created_at";
        const safeSortOrder = sort_order === "asc" ? "asc" : "desc";
        let countQuery = (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES);
        if (search) {
            countQuery = countQuery.where((builder) => {
                builder
                    .where("page_key", "ilike", `%${search}%`)
                    .orWhere("meta_title", "ilike", `%${search}%`);
            });
        }
        if (status) {
            countQuery = countQuery.where("status", status);
        }
        const [{ count }] = await countQuery.count("* as count");
        const total = parseInt(count);
        let baseQuery = (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES).select("*");
        if (search) {
            baseQuery = baseQuery.where((builder) => {
                builder
                    .where("page_key", "ilike", `%${search}%`)
                    .orWhere("meta_title", "ilike", `%${search}%`);
            });
        }
        if (status) {
            baseQuery = baseQuery.where("status", status);
        }
        const pages = await baseQuery
            .clone()
            .orderBy(safeSortBy, safeSortOrder)
            .limit(limit)
            .offset(offset);
        return { pages, total };
    }
    /**
     * Get single SEO record by ID
     */
    async getStaticPageSEOById(id) {
        const page = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .where("id", id)
            .first();
        return page || null;
    }
    /**
     * Create new static SEO record
     */
    async createStaticPageSEO(data) {
        var _a, _b, _c, _d, _e;
        const exists = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .where("page_key", data.page_key)
            .first();
        if (exists) {
            throw new HttpException_1.default(400, "SEO record already exists for this page_key");
        }
        const [created] = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .insert({
            page_key: data.page_key,
            meta_title: data.meta_title || null,
            meta_description: data.meta_description || null,
            meta_keywords: data.meta_keywords || null,
            canonical_url: data.canonical_url || null,
            og_image: data.og_image || null,
            noindex: (_a = data.noindex) !== null && _a !== void 0 ? _a : false,
            nofollow: (_b = data.nofollow) !== null && _b !== void 0 ? _b : false,
            priority: (_c = data.priority) !== null && _c !== void 0 ? _c : 0.8,
            changefreq: (_d = data.changefreq) !== null && _d !== void 0 ? _d : "weekly",
            status: (_e = data.status) !== null && _e !== void 0 ? _e : "active",
        })
            .returning("*");
        return created;
    }
    /**
     * Update static SEO record
     */
    async updateStaticPageSEO(id, data) {
        const existing = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .where("id", id)
            .first();
        if (!existing) {
            throw new HttpException_1.default(404, "SEO record not found");
        }
        const updateData = {};
        if (data.meta_title !== undefined)
            updateData.meta_title = data.meta_title;
        if (data.meta_description !== undefined)
            updateData.meta_description = data.meta_description;
        if (data.meta_keywords !== undefined)
            updateData.meta_keywords = data.meta_keywords;
        if (data.canonical_url !== undefined)
            updateData.canonical_url = data.canonical_url;
        if (data.og_image !== undefined)
            updateData.og_image = data.og_image;
        if (data.noindex !== undefined)
            updateData.noindex = data.noindex;
        if (data.nofollow !== undefined)
            updateData.nofollow = data.nofollow;
        if (data.priority !== undefined)
            updateData.priority = data.priority;
        if (data.changefreq !== undefined)
            updateData.changefreq = data.changefreq;
        if (data.status !== undefined)
            updateData.status = data.status;
        updateData.updated_at = index_schema_1.default.fn.now();
        await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES).where("id", id).update(updateData);
        return this.getStaticPageSEOById(id);
    }
    /**
     * Delete SEO record
     */
    async deleteStaticPageSEO(id) {
        const deleted = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .where("id", id)
            .delete();
        if (deleted === 0) {
            throw new HttpException_1.default(404, "SEO record not found");
        }
        return true;
    }
    /**
     * Check if page_key exists
     */
    async checkPageKeyExists(page_key) {
        const record = await (0, index_schema_1.default)(index_schema_1.T.SEO_STATIC_PAGES)
            .select("page_key")
            .where("page_key", page_key)
            .first();
        return !!record;
    }
}
exports.default = SeoService;
//# sourceMappingURL=seo.service.js.map