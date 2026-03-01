import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";

interface LegalPagesFilters {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    sort_by: string;
    sort_order: string;
}

class LegalPagesService {
    /* =====================================================
       PUBLIC METHODS
    ===================================================== */

    /**
     * Get legal page by slug (Frontend use)
     */
    public async getLegalPageBySlug(slug: string) {
        const page = await DB(T.LEGAL_PAGES)
            .select(
                "id",
                "page_key",
                "slug",
                "title",
                "content",
                "content_json",
                "meta_title",
                "meta_description",
                "canonical_url",
                "noindex",
                "status",
                "updated_at",
            )
            .where("slug", slug)
            .where("status", "published")
            .first();

        return page || null;
    }

    /**
     * Get all published legal pages (Frontend footer use)
     */
    public async getAllPublishedLegalPages() {
        return DB(T.LEGAL_PAGES)
            .select(
                "id",
                "page_key",
                "slug",
                "title",
                "updated_at",
            )
            .where("status", "published")
            .orderBy("created_at", "desc");
    }

    /* =====================================================
       ADMIN METHODS
    ===================================================== */

    /**
     * Get all legal pages (with optional pagination)
     */
    public async getAllLegalPages(filters?: LegalPagesFilters) {
        if (!filters) {
            return DB(T.LEGAL_PAGES)
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

        let countQuery = DB(T.LEGAL_PAGES);

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
        const total = parseInt(count as string);

        let baseQuery = DB(T.LEGAL_PAGES).select("*");

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
    public async getLegalPageById(id: number) {
        const page = await DB(T.LEGAL_PAGES)
            .where("id", id)
            .first();

        return page || null;
    }

    /**
     * Create legal page
     */
    public async createLegalPage(data: any) {
        const exists = await DB(T.LEGAL_PAGES)
            .where("slug", data.slug)
            .first();

        if (exists) {
            throw new HttpException(
                400,
                "Legal page already exists with this slug",
            );
        }

        const [created] = await DB(T.LEGAL_PAGES)
            .insert({
                page_key: data.page_key,
                slug: data.slug,
                title: data.title,
                content: data.content,
                content_json: data.content_json || {},
                meta_title: data.meta_title || null,
                meta_description: data.meta_description || null,
                canonical_url: data.canonical_url || null,
                noindex: data.noindex ?? false,
                status: data.status ?? "draft",
                version: data.version ?? 1,
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
    public async updateLegalPage(id: number, data: any) {
        const existing = await DB(T.LEGAL_PAGES)
            .where("id", id)
            .first();

        if (!existing) {
            throw new HttpException(404, "Legal page not found");
        }

        const updateData: any = {};

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

        updateData.updated_at = DB.fn.now();

        await DB(T.LEGAL_PAGES)
            .where("id", id)
            .update(updateData);

        return this.getLegalPageById(id);
    }

    /**
     * Delete legal page
     */
    public async deleteLegalPage(id: number) {
        const deleted = await DB(T.LEGAL_PAGES)
            .where("id", id)
            .delete();

        if (deleted === 0) {
            throw new HttpException(404, "Legal page not found");
        }

        return true;
    }

    /**
     * Check if slug exists
     */
    public async checkSlugExists(slug: string): Promise<boolean> {
        const record = await DB(T.LEGAL_PAGES)
            .select("slug")
            .where("slug", slug)
            .first();

        return !!record;
    }
}

export default LegalPagesService;