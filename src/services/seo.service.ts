import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

interface SeoFilters {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sort_by: string;
    sort_order: string;
}

class SeoService {
    /* =====================================================
       PUBLIC METHODS
    ===================================================== */

    /**
     * Get static page SEO by page_key (Frontend use)
     */
    public async getStaticPageSEO(page_key: string) {
        const page = await DB(T.SEO_STATIC_PAGES)
            .select(
                "id",
                "page_key",
                "meta_title",
                "meta_description",
                "meta_keywords",
                "canonical_url",
                "og_image",
                "noindex",
                "nofollow",
                "priority",
                "changefreq",
                "status",
                "updated_at",
            )
            .where("page_key", page_key)
            .where("status", "active")
            .first();

        return page || null;
    }

    /**
     * Get static pages for sitemap.xml
     */
    public async getStaticPagesForSitemap() {
        const pages = await DB(T.SEO_STATIC_PAGES)
            .select(
                "page_key",
                "canonical_url",
                "priority",
                "changefreq",
                "updated_at",
            )
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
    public async getAllStaticPageSEO(filters?: SeoFilters) {
        if (!filters) {
            return DB(T.SEO_STATIC_PAGES).orderBy("created_at", "desc");
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

        let countQuery = DB(T.SEO_STATIC_PAGES);

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
        const total = parseInt(count as string);

        let baseQuery = DB(T.SEO_STATIC_PAGES).select("*");

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
    public async getStaticPageSEOById(id: number) {
        const page = await DB(T.SEO_STATIC_PAGES)
            .where("id", id)
            .first();

        return page || null;
    }

    /**
     * Create new static SEO record
     */
    public async createStaticPageSEO(data: any) {
        const exists = await DB(T.SEO_STATIC_PAGES)
            .where("page_key", data.page_key)
            .first();

        if (exists) {
            throw new HttpException(
                400,
                "SEO record already exists for this page_key",
            );
        }

        const [created] = await DB(T.SEO_STATIC_PAGES)
            .insert({
                page_key: data.page_key,
                meta_title: data.meta_title || null,
                meta_description: data.meta_description || null,
                meta_keywords: data.meta_keywords || null,
                canonical_url: data.canonical_url || null,
                og_image: data.og_image || null,
                noindex: data.noindex ?? false,
                nofollow: data.nofollow ?? false,
                priority: data.priority ?? 0.8,
                changefreq: data.changefreq ?? "weekly",
                status: data.status ?? "active",
            })
            .returning("*");

        return created;
    }

    /**
     * Update static SEO record
     */
    public async updateStaticPageSEO(id: number, data: any) {
        const existing = await DB(T.SEO_STATIC_PAGES)
            .where("id", id)
            .first();

        if (!existing) {
            throw new HttpException(404, "SEO record not found");
        }

        const updateData: any = {};

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

        updateData.updated_at = DB.fn.now();

        await DB(T.SEO_STATIC_PAGES).where("id", id).update(updateData);

        return this.getStaticPageSEOById(id);
    }

    /**
     * Delete SEO record
     */
    public async deleteStaticPageSEO(id: number) {
        const deleted = await DB(T.SEO_STATIC_PAGES)
            .where("id", id)
            .delete();

        if (deleted === 0) {
            throw new HttpException(404, "SEO record not found");
        }

        return true;
    }

    /**
     * Check if page_key exists
     */
    public async checkPageKeyExists(page_key: string): Promise<boolean> {
        const record = await DB(T.SEO_STATIC_PAGES)
            .select("page_key")
            .where("page_key", page_key)
            .first();

        return !!record;
    }
}

export default SeoService;