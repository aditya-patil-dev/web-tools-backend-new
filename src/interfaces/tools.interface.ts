/**
 * Tool-related TypeScript interfaces and types
 */

export type ToolStatus = "active" | "draft" | "disabled" | "deprecated";
export type PageStatus = "active" | "draft" | "disabled";
export type ToolBadge = "new" | "popular" | "pro" | null;
export type AccessLevel = "free" | "premium" | "pro" | "enterprise";

// ============================================
// DATABASE MODELS
// ============================================

/**
 * Tools table model
 */
export interface Tool {
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    tool_type: string;
    tags: string[];
    short_description: string;
    badge: ToolBadge;
    access_level: AccessLevel;
    tool_url: string;
    status: ToolStatus;
    is_featured: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Tool pages table model
 */
export interface ToolPage {
    id: number;
    tool_slug: string;
    page_title: string;
    page_intro: string | null;
    long_content: string | null;
    features: Feature[];
    faqs: FAQ[];
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string[];
    canonical_url: string | null;
    noindex: boolean;
    schema_markup: string | null;
    status: PageStatus;
    created_at: Date;
    updated_at: Date;
}

/**
 * Tools category pages table model
 */
export interface CategoryPage {
    id: number;
    category_slug: string;
    page_title: string;
    page_description: string;
    page_intro: string | null;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    canonical_url: string | null;
    noindex: boolean;
    status: PageStatus;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// NESTED TYPES
// ============================================

export interface Feature {
    title: string;
    description: string;
}

export interface FAQ {
    question: string;
    answer: string;
}

// ============================================
// REQUEST/RESPONSE DTOs
// ============================================

/**
 * Create/Update tool request body
 */
export interface ToolEditorRequest {
    category?: {
        category_slug: string;
        page_title: string;
        page_description: string;
        page_intro?: string | null;
        meta_title?: string | null;
        meta_description?: string | null;
        meta_keywords?: string | null;
        canonical_url?: string | null;
        noindex?: boolean;
        status?: PageStatus;
    };
    tool: {
        title: string;
        slug: string;
        category_slug: string;
        tool_type: string;
        tags?: string[];
        short_description: string;
        badge?: ToolBadge;
        access_level?: AccessLevel;
        tool_url: string;
        status?: ToolStatus;
        is_featured?: boolean;
        sort_order?: number;
    };
    page: {
        tool_slug?: string;
        page_title: string;
        page_intro?: string | null;
        long_content?: string | null;
        features?: Feature[];
        faqs?: FAQ[];
        meta_title?: string | null;
        meta_description?: string | null;
        meta_keywords?: string[];
        canonical_url?: string | null;
        noindex?: boolean;
        schema_markup?: string | null;
        status?: PageStatus;
    };
}

/**
 * Tool with all related data (for editing)
 */
export interface ToolEditorResponse {
    category: {
        category_slug: string;
        page_title: string;
        page_description: string;
        page_intro: string | null;
        meta_title: string | null;
        meta_description: string | null;
        meta_keywords: string | null;
        canonical_url: string | null;
        noindex: boolean;
        status: PageStatus;
    };
    tool: {
        id: number;
        title: string;
        slug: string;
        category_slug: string;
        tool_type: string;
        tags: string[];
        short_description: string;
        badge: ToolBadge;
        access_level: AccessLevel;
        tool_url: string;
        status: ToolStatus;
        is_featured: boolean;
        sort_order: number;
    };
    page: {
        tool_slug: string;
        page_title: string;
        page_intro: string | null;
        long_content: string | null;
        features: Feature[];
        faqs: FAQ[];
        meta_title: string | null;
        meta_description: string | null;
        meta_keywords: string[];
        canonical_url: string | null;
        noindex: boolean;
        schema_markup: string | null;
        status: PageStatus;
    };
}

/**
 * Tool listing item
 */
export interface ToolListItem {
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    tool_type: string;
    short_description: string;
    tags: string[];
    badge: ToolBadge;
    access_level: AccessLevel;
    tool_url: string;
    status: ToolStatus;
    is_featured: boolean;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Category with tool count
 */
export interface CategoryWithCount {
    category_slug: string;
    page_title: string;
    page_description: string;
    status: PageStatus;
    tool_count: number;
    created_at: Date;
    updated_at: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

/**
 * Bulk update request
 */
export interface BulkUpdateRequest {
    ids: number[];
    updates: {
        status?: ToolStatus;
        category_slug?: string;
        badge?: ToolBadge;
        access_level?: AccessLevel;
        is_featured?: boolean;
    };
}

/**
 * Bulk delete request
 */
export interface BulkDeleteRequest {
    ids: number[];
    permanent?: boolean;
}

/**
 * Duplicate tool request
 */
export interface DuplicateToolRequest {
    new_slug: string;
    new_title?: string;
}

/**
 * Tool analytics response
 */
export interface ToolAnalytics {
    id: number;
    title: string;
    slug: string;
    category_slug: string;
    created_at: Date;
    analytics: {
        total_views: number;
        unique_users: number;
        avg_session_duration: number;
        // Add more analytics fields as needed
    };
}

// ============================================
// QUERY FILTERS
// ============================================

export interface ToolFilters {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: ToolStatus;
    badge?: ToolBadge;
    access_level?: AccessLevel;
    is_featured?: boolean;
    sort_by?: "created_at" | "updated_at" | "title" | "sort_order";
    sort_order?: "asc" | "desc";
}