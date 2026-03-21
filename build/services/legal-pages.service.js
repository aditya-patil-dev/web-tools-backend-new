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
class LegalPagesService {
    /* =====================================================
       PUBLIC METHODS
    ===================================================== */
    /**
     * Get legal page by slug (Frontend use)
     */
    async getLegalPageBySlug(slug) {
        const page = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .select("id", "page_key", "slug", "title", "content", "content_json", "meta_title", "meta_description", "canonical_url", "noindex", "status", "updated_at")
            .where("slug", slug)
            .where("status", "published")
            .first();
        return page || null;
    }
    /**
     * Get all published legal pages (Frontend footer use)
     */
    async getAllPublishedLegalPages() {
        return (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .select("id", "page_key", "slug", "title", "updated_at")
            .where("status", "published")
            .orderBy("created_at", "desc");
    }
    /* =====================================================
       ADMIN METHODS
    ===================================================== */
    /**
     * Get all legal pages (with optional pagination)
     */
    async getAllLegalPages(filters) {
        if (!filters) {
            return (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
                .select("*")
                .orderBy("created_at", "desc");
        }
        const { page, limit, search, status, sort_by, sort_order } = filters;
        const offset = (page - 1) * limit;
        const allowedSortColumns = [
            "created_at",
            "updated_at",
            "title",
            "slug",
            "status",
        ];
        const safeSortBy = allowedSortColumns.includes(sort_by)
            ? sort_by
            : "created_at";
        const safeSortOrder = sort_order === "asc" ? "asc" : "desc";
        let countQuery = (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES);
        if (search) {
            countQuery = countQuery.where((builder) => {
                builder
                    .where("title", "ilike", `%${search}%`)
                    .orWhere("slug", "ilike", `%${search}%`)
                    .orWhere("page_key", "ilike", `%${search}%`);
            });
        }
        if (status) {
            countQuery = countQuery.where("status", status);
        }
        const [{ count }] = await countQuery.count("* as count");
        const total = parseInt(count);
        let baseQuery = (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES).select("*");
        if (search) {
            baseQuery = baseQuery.where((builder) => {
                builder
                    .where("title", "ilike", `%${search}%`)
                    .orWhere("slug", "ilike", `%${search}%`)
                    .orWhere("page_key", "ilike", `%${search}%`);
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
     * Get legal page by ID
     */
    async getLegalPageById(id) {
        const page = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .where("id", id)
            .first();
        return page || null;
    }
    /**
     * Create legal page
     */
    async createLegalPage(data) {
        var _a, _b, _c;
        const exists = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .where("slug", data.slug)
            .first();
        if (exists) {
            throw new HttpException_1.default(400, "Legal page already exists with this slug");
        }
        const [created] = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .insert({
            page_key: data.page_key,
            slug: data.slug,
            title: data.title,
            content: data.content,
            content_json: data.content_json || {},
            meta_title: data.meta_title || null,
            meta_description: data.meta_description || null,
            canonical_url: data.canonical_url || null,
            noindex: (_a = data.noindex) !== null && _a !== void 0 ? _a : false,
            status: (_b = data.status) !== null && _b !== void 0 ? _b : "draft",
            version: (_c = data.version) !== null && _c !== void 0 ? _c : 1,
            version_notes: data.version_notes || null,
            change_log: data.change_log || [],
            created_by: data.created_by || null,
            updated_by: data.updated_by || null,
        })
            .returning("*");
        return created;
    }
    /**
     * Update legal page
     */
    async updateLegalPage(id, data) {
        const existing = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .where("id", id)
            .first();
        if (!existing) {
            throw new HttpException_1.default(404, "Legal page not found");
        }
        const updateData = {};
        if (data.page_key !== undefined)
            updateData.page_key = data.page_key;
        if (data.slug !== undefined)
            updateData.slug = data.slug;
        if (data.title !== undefined)
            updateData.title = data.title;
        if (data.content !== undefined)
            updateData.content = data.content;
        if (data.content_json !== undefined)
            updateData.content_json = data.content_json;
        if (data.meta_title !== undefined)
            updateData.meta_title = data.meta_title;
        if (data.meta_description !== undefined)
            updateData.meta_description = data.meta_description;
        if (data.canonical_url !== undefined)
            updateData.canonical_url = data.canonical_url;
        if (data.noindex !== undefined)
            updateData.noindex = data.noindex;
        if (data.status !== undefined)
            updateData.status = data.status;
        if (data.version !== undefined)
            updateData.version = data.version;
        if (data.version_notes !== undefined)
            updateData.version_notes = data.version_notes;
        if (data.change_log !== undefined)
            updateData.change_log = data.change_log;
        if (data.updated_by !== undefined)
            updateData.updated_by = data.updated_by;
        updateData.updated_at = index_schema_1.default.fn.now();
        await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .where("id", id)
            .update(updateData);
        return this.getLegalPageById(id);
    }
    /**
     * Delete legal page
     */
    async deleteLegalPage(id) {
        const deleted = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .where("id", id)
            .delete();
        if (deleted === 0) {
            throw new HttpException_1.default(404, "Legal page not found");
        }
        return true;
    }
    /**
     * Check if slug exists
     */
    async checkSlugExists(slug) {
        const record = await (0, index_schema_1.default)(index_schema_1.T.LEGAL_PAGES)
            .select("slug")
            .where("slug", slug)
            .first();
        return !!record;
    }
}
exports.default = LegalPagesService;
//# sourceMappingURL=legal-pages.service.js.map