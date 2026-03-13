// ─────────────────────────────────────────────────────────────────────────────
// IMPORT / EXPORT REGISTRY
// To add a new resource: add one object to REGISTRY. Nothing else changes.
// ─────────────────────────────────────────────────────────────────────────────

export type FieldTransform = "array" | "boolean" | "number" | "json";

export interface ColumnTransforms {
    [column: string]: FieldTransform;
}

export interface ResourceConfig {
    /** DB table name */
    table: string;

    /** Column used for upsert in "update" mode */
    uniqueKey: string;

    /** Columns returned on export (order matters → CSV column order) */
    columns: string[];

    /**
     * Columns that are NOT NULL in the schema — must be non-empty on import.
     * Mirrors the .notNullable() constraints exactly.
     */
    required: string[];

    /**
     * Type coercions applied to incoming CSV strings before DB insert.
     * Any column not listed here is kept as a plain string (or null if empty).
     */
    transforms?: ColumnTransforms;

    /**
     * Allowed enum values per column.
     * Validated before insert so bad values are caught with a clear message.
     */
    enums?: Record<string, string[]>;
}

export type ResourceName = "tools" | "tool_categories" | "tool_pages";

// ─────────────────────────────────────────────────────────────────────────────

export const REGISTRY: Record<ResourceName, ResourceConfig> = {

    // ══════════════════════════════════════════════════════════════════════════
    // tools
    // NOT NULL: title, slug, category_slug, tool_type, tool_url
    // status  : "active" | "draft" | "archived"   default "draft"
    // tags    : text[]  (PostgreSQL native array)
    // ══════════════════════════════════════════════════════════════════════════
    tools: {
        table: "tools",
        uniqueKey: "id",

        columns: [
            "id",
            "title",
            "slug",
            "category_slug",
            "tool_type",
            "short_description",
            "tool_url",
            "tags",
            "status",
            "badge",
            "access_level",
            "daily_limit",
            "monthly_limit",
            "is_featured",
            "sort_order",
            "rating",
            "views",
            "users_count",
            "created_at",
            "updated_at",
        ],

        // Mirrors every .notNullable() column in tools.schema.ts
        required: ["title", "slug", "category_slug", "tool_type", "tool_url"],

        transforms: {
            tags: "array",   // "ai,chat" → ["ai","chat"] → stored as text[]
            is_featured: "boolean",
            daily_limit: "number",
            monthly_limit: "number",
            sort_order: "number",
            rating: "number",
            views: "number",
            users_count: "number",
        },

        enums: {
            status: ["active", "draft", "archived"],
            access_level: ["free", "pro", "premium"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // tools_category_pages
    // NOT NULL : category_slug (unique), page_title
    // status   : "draft" | "published" | "archived"   default "draft"
    // ══════════════════════════════════════════════════════════════════════════
    tool_categories: {
        table: "tools_category_pages",
        uniqueKey: "id",

        columns: [
            "id",
            "category_slug",
            "page_title",
            "page_description",
            "page_intro",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "canonical_url",
            "noindex",
            "status",
            "created_at",
            "updated_at",
        ],

        required: ["category_slug", "page_title"],

        transforms: {
            noindex: "boolean",
        },

        enums: {
            status: ["draft", "published", "archived"],
        },
    },

    // ══════════════════════════════════════════════════════════════════════════
    // tool_pages
    // NOT NULL : tool_slug, page_title
    // status   : "draft" | "published" | "archived"   default "draft"
    // features : jsonb  [{title, description}]
    // faqs     : jsonb  [{question, answer}]
    // ══════════════════════════════════════════════════════════════════════════
    tool_pages: {
        table: "tool_pages",
        uniqueKey: "id",

        columns: [
            "id",
            "tool_slug",
            "page_title",
            "page_intro",
            "long_content",
            "features",
            "faqs",
            "meta_title",
            "meta_description",
            "meta_keywords",
            "canonical_url",
            "schema_markup",
            "noindex",
            "status",
            "created_at",
            "updated_at",
        ],

        required: ["tool_slug", "page_title"],

        transforms: {
            features: "json",
            faqs: "json",
            schema_markup: "json",
            noindex: "boolean",
        },

        enums: {
            status: ["draft", "active", "archived"],
        },
    },

};

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check if a string is a valid resource name
// ─────────────────────────────────────────────────────────────────────────────

export function isValidResource(name: string): name is ResourceName {
    return name in REGISTRY;
}