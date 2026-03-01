import DB, { T } from "../database/index.schema";
import axios from "axios";
import HttpException from "../exceptions/HttpException";

type TrackEventPayload = {
    tool_id: number;
    event_type: "PAGE_VIEW" | "TOOL_RUN" | "RECOMMENDATION_CLICK";
    session_id: string;
    ref_tool_id?: number | null;
    user_id?: number | null;
    meta?: any;
};

class ToolsService {
    /**
     * Tools listing (cards)
     * Reads ONLY `tools`
     */
    public async getToolsByCategory(categorySlug: string): Promise<any[]> {
        return DB(T.TOOLS)
            .select(
                "id",
                "title",
                "slug",
                "short_description",
                "category_slug",
                "tool_type",
                "tags",
                "badge",
                "rating",
                "views",
                "users_count",
                "tool_url",
            )
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
    public async getToolPage(
        categorySlug: string,
        toolSlug: string,
        sessionId?: string
    ) {

        const tool = await DB("tools")
            .leftJoin(
                "tool_pages",
                "tools.slug",
                "tool_pages.tool_slug"
            )
            .select(
                "tools.id",
                "tools.title",
                "tools.slug",
                "tools.category_slug",
                "tools.tool_type",
                "tools.tags",
                "tools.short_description",
                "tools.badge",
                "tools.rating",
                "tools.views",
                "tools.users_count",
                "tools.last_used_at",
                "tools.access_level",
                "tools.daily_limit",
                "tools.monthly_limit",
                "tools.tool_url",

                "tool_pages.page_title",
                "tool_pages.page_intro",
                "tool_pages.long_content",
                "tool_pages.features",
                "tool_pages.faqs",
                "tool_pages.meta_title",
                "tool_pages.meta_description",
                "tool_pages.meta_keywords",
                "tool_pages.canonical_url",
                "tool_pages.schema_markup",
                "tool_pages.noindex"
            )
            .where({
                "tools.slug": toolSlug,
                "tools.category_slug": categorySlug,
                "tools.status": "active",
            })
            .andWhere("tool_pages.status", "active")
            .first();


        if (!tool) return null;


        /*
        AUTO TRACK PAGE VIEW
        */

        if (sessionId) {

            await Promise.all([

                DB("tools")
                    .where({ id: tool.id })
                    .update({
                        views: DB.raw("views + 1"),
                    }),

                this.trackToolEvent({
                    tool_id: tool.id,
                    event_type: "PAGE_VIEW",
                    session_id: sessionId,
                    meta: { page: "tool_detail" }
                })

            ]);

        }

        /*
        GET RECOMMENDATIONS
        */

        const recommendations =
            await this.getRecommendations(tool.id);


        return {
            ...tool,
            recommendations
        };

    }

    public async getCategoryPage(categorySlug: string) {
        const categoryPage = await DB("tools_category_pages")
            .select(
                "page_title",
                "page_description",
                "page_intro",
                "meta_title",
                "meta_description",
                "meta_keywords",
                "canonical_url",
                "noindex",
            )
            .where({
                category_slug: categorySlug,
                status: "active",
            })
            .first();

        return categoryPage || null;
    }

    private GOOGLE_API =
        "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

    /**
     * Call Google PageSpeed API
     */
    public async testWebsiteSpeed(url: string) {

        try {

            const response = await axios.get(this.GOOGLE_API, {
                params: {
                    url,
                    key: process.env.GOOGLE_PAGESPEED_API_KEY,
                    category: ["performance"],
                    strategy: "mobile",
                },
            });

            const lighthouse =
                response.data.lighthouseResult;

            const audits = lighthouse.audits;
            const categories = lighthouse.categories;

            const score =
                Math.round(categories.performance.score * 100);

            const grade =
                score >= 90
                    ? "A"
                    : score >= 80
                        ? "B"
                        : score >= 70
                            ? "C"
                            : score >= 60
                                ? "D"
                                : "F";

            const totalBytes =
                audits["total-byte-weight"]?.numericValue || 0;

            const requests =
                audits["network-requests"]?.details?.items?.length || 0;

            const metrics = {
                loadTime:
                    audits["interactive"]?.numericValue || 0,

                domContentLoaded:
                    audits["dom-content-loaded"]?.numericValue || 0,

                firstContentfulPaint:
                    audits["first-contentful-paint"]?.numericValue || 0,

                timeToInteractive:
                    audits["interactive"]?.numericValue || 0,

                totalSize:
                    totalBytes / 1024,

                requests,

                imageSize: this.getResourceSize(
                    audits,
                    "image"
                ),

                scriptSize: this.getResourceSize(
                    audits,
                    "script"
                ),

                styleSize: this.getResourceSize(
                    audits,
                    "stylesheet"
                ),

                score,

                grade,

                recommendations:
                    this.extractRecommendations(audits),

            };

            return metrics;

        } catch (error: any) {

            if (error.response?.data?.error?.message) {
                throw new HttpException(
                    400,
                    error.response.data.error.message
                );
            }

            throw new HttpException(
                500,
                "Failed to analyze website speed"
            );

        }

    }


    /**
     * Resource size calculator
     */
    private getResourceSize(
        audits: any,
        type: string
    ) {

        const items =
            audits["network-requests"]?.details?.items || [];

        return (
            items
                .filter(
                    (item: any) => item.resourceType === type
                )
                .reduce(
                    (sum: number, item: any) =>
                        sum + item.transferSize,
                    0
                ) / 1024
        );

    }


    /**
     * Extract recommendations
     */
    private extractRecommendations(audits: any) {

        const recommendations = [];

        const importantAudits = [
            "render-blocking-resources",
            "unused-css-rules",
            "unused-javascript",
            "modern-image-formats",
            "uses-text-compression",
        ];

        for (const key of importantAudits) {

            const audit = audits[key];

            if (audit && audit.score !== 1) {

                recommendations.push({
                    severity:
                        audit.score < 0.5
                            ? "critical"
                            : audit.score < 0.9
                                ? "warning"
                                : "info",

                    title: audit.title,

                    description: audit.description,
                });

            }
        }

        return recommendations;

    }

    /*
  ========================================
  TRACK EVENT
  ========================================
  */

    public async trackToolEvent(
        payload: TrackEventPayload
    ) {

        await DB("tool_events")
            .insert({

                tool_id: payload.tool_id,

                event_type: payload.event_type,

                session_id: payload.session_id,

                ref_tool_id: payload.ref_tool_id || null,

                user_id: payload.user_id || null,

                meta: DB.raw(
                    "?::jsonb",
                    [JSON.stringify(payload.meta || {})]
                )

            });


        /*
        TOOL RUN UPDATE
        */

        if (payload.event_type === "TOOL_RUN") {

            await DB("tools")
                .where({
                    id: payload.tool_id
                })
                .update({

                    users_count:
                        DB.raw("users_count + 1"),

                    last_used_at:
                        DB.fn.now()

                });

        }

    }



    /*
    ========================================
    RECOMMENDATIONS MASTER
    ========================================
    */

    private async getRecommendations(
        toolId: number
    ) {

        const [related, popular, alsoUsed] =
            await Promise.all([

                this.getRelatedTools(toolId),

                this.getPopularTools(toolId),

                this.getAlsoUsedTools(toolId)

            ]);


        return {

            related,
            popular,
            alsoUsed

        };

    }



    /*
    ========================================
    RELATED TOOLS
    ========================================
    */

    private async getRelatedTools(
        toolId: number,
        limit = 6
    ) {

        const base =
            await DB("tools")
                .select(
                    "category_slug",
                    "tool_type",
                    "tags"
                )
                .where({ id: toolId })
                .first();


        if (!base) return [];


        return DB("tools")

            .select(
                "id",
                "title",
                "slug",
                "short_description",
                "category_slug",
                "tool_type",
                "badge",
                "rating",
                "views",
                "users_count",
                "tool_url"
            )

            .where("status", "active")

            .whereNot("id", toolId)

            .andWhere((qb) => {

                qb
                    .where(
                        "category_slug",
                        base.category_slug
                    )
                    .orWhere(
                        "tool_type",
                        base.tool_type
                    )
                    .orWhereRaw(
                        "tags && ?::text[]",
                        [base.tags || []]
                    );

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

    private async getPopularTools(
        toolId: number,
        limit = 8
    ) {

        const popular =
            await DB("tool_events as e")

                .join(
                    "tools as t",
                    "t.id",
                    "e.tool_id"
                )

                .select(
                    "t.id",
                    "t.title",
                    "t.slug",
                    "t.short_description",
                    "t.category_slug",
                    "t.tool_type",
                    "t.badge",
                    "t.rating",
                    "t.views",
                    "t.users_count",
                    "t.tool_url",

                    DB.raw(
                        "COUNT(*)::int as runs"
                    )
                )

                .where(
                    "e.event_type",
                    "TOOL_RUN"
                )

                .where(
                    "e.created_at",
                    ">=",
                    DB.raw(
                        "now() - interval '7 days'"
                    )
                )

                .whereNot(
                    "t.id",
                    toolId
                )

                .groupBy("t.id")

                .orderBy("runs", "desc")

                .limit(limit);


        if (popular.length)
            return popular;


        /*
        FALLBACK
        */

        return DB("tools")

            .select(
                "id",
                "title",
                "slug",
                "short_description",
                "category_slug",
                "tool_type",
                "badge",
                "rating",
                "views",
                "users_count",
                "tool_url"
            )

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

    private async getAlsoUsedTools(
        toolId: number,
        limit = 6
    ) {

        const sessions =
            await DB("tool_events")

                .distinct("session_id")

                .where({
                    tool_id: toolId,
                    event_type: "TOOL_RUN"
                })

                .limit(500);


        const ids =
            sessions.map(
                s => s.session_id
            );


        if (!ids.length)
            return [];


        return DB("tool_events as e")

            .join(
                "tools as t",
                "t.id",
                "e.tool_id"
            )

            .select(
                "t.id",
                "t.title",
                "t.slug",
                "t.short_description",
                "t.category_slug",
                "t.tool_type",
                "t.badge",
                "t.rating",
                "t.views",
                "t.users_count",
                "t.tool_url",

                DB.raw(
                    "COUNT(*)::int as hits"
                )
            )

            .whereIn(
                "e.session_id",
                ids
            )

            .whereNot(
                "t.id",
                toolId
            )

            .groupBy("t.id")

            .orderBy("hits", "desc")

            .limit(limit);

    }
}

export default ToolsService;